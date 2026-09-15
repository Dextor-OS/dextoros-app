/*
  Skills, versions and training sessions (docs: teach-a-skill.md, versions.md, which-robots-can-run-a-skill.md).
  Pure functions over the snapshot; the simulated source calls them and writes the results.
*/

import type { Robot, SkillState, SkillVersion, TrainingSession } from "@/lib/domain/types";
import { type CapabilityId, FLEET, joinLabels, SKILLS } from "@/lib/fleet";

export const SESSION_TARGET = 24;
const TRAIN_TICKS = 6;
const EVAL_TICKS = 4;
const SESSION_LOG_LIMIT = 8;

export function missingFor(robot: { caps: CapabilityId[] }, skill: { needs: CapabilityId[] }) {
  return skill.needs.filter((need) => !robot.caps.includes(need));
}

export const canRun = (robot: { caps: CapabilityId[] }, skill: { needs: CapabilityId[] }) => missingFor(robot, skill).length === 0;

const participating = (robot: Robot) => robot.pairing === "live" && robot.activity !== "offline";

/** Robots that hold every capability the skill needs, whatever their state. */
export function capableRobots(robots: Robot[], skill: SkillState) {
  return robots.filter((r) => canRun(r, skill));
}

/** Teacher first, then every robot that can run the skill, then the rest, each group in fleet order. */
export function rankRobots(robots: Robot[], skill: SkillState) {
  const rank = (robot: Robot) => (robot.id === skill.teacher ? 0 : canRun(robot, skill) ? 1 : 2);
  return [...robots].sort((a, b) => rank(a) - rank(b));
}

export function statusFor(robot: Robot, skill: SkillState): { kind: "learned" | "taught" | "pending" | "blocked"; text: string } {
  const missing = missingFor(robot, skill);
  if (missing.length) return { kind: "blocked", text: `Needs ${joinLabels(missing)}` };
  const version = skill.learned[robot.id];
  if (version === undefined) return { kind: "pending", text: "Learns on connection" };
  if (robot.id === skill.teacher && version === skill.version) return { kind: "taught", text: `v${version} taught here` };
  return { kind: "learned", text: `v${version} learned` };
}

/** Skills a robot can run, with the version it holds. */
export function skillsFor(robot: Robot, skills: SkillState[]) {
  return skills.map((skill) => ({ skill, status: statusFor(robot, skill) }));
}

/** Per-platform base success rate for episodes. Legs are hardest, fixed arms easiest. */
function episodeRate(robot: Robot, skill: SkillState) {
  const base = robot.kind === "arm" ? 0.8 : robot.kind === "mobile" ? 0.72 : 0.64;
  return Math.min(0.95, base + (skill.version - 1) * 0.01);
}

export function seedSkills(): SkillState[] {
  return SKILLS.map((skill) => {
    const learnedBy = FLEET.filter((r) => canRun(r, skill)).map((r) => r.id);
    const first: SkillVersion = { version: skill.version, source: "taught", time: "08:52:10", teacher: skill.teacher, learnedBy };
    return {
      id: skill.id,
      name: skill.name,
      needs: skill.needs,
      version: skill.version,
      teacher: skill.teacher,
      versions: [first],
      learned: Object.fromEntries(learnedBy.map((id) => [id, skill.version])),
    };
  });
}

/** A new demonstration: the version moves on and every capable robot learns it. */
export function teachSkill(skill: SkillState, robots: Robot[], teacherId: string, time: string): { skill: SkillState; events: [string, string][] } {
  const version = skill.version + 1;
  const learners = capableRobots(robots, skill);
  const next: SkillState = {
    ...skill,
    version,
    teacher: teacherId,
    versions: [{ version, source: "taught", time, teacher: teacherId, learnedBy: learners.map((r) => r.id) }, ...skill.versions],
    learned: { ...skill.learned, ...Object.fromEntries(learners.map((r) => [r.id, version])) },
  };
  const events: [string, string][] = learners.map((r) =>
    r.id === teacherId ? [r.id, `Taught ${skill.name} v${version}. Shared with ${learners.length - 1} robots`] : [r.id, `Learned ${skill.name} v${version} from ${teacherId}`],
  );
  return { skill: next, events };
}

/** A robot that just connected picks up the current version of every skill it can run. */
export function learnOnConnect(robot: Robot, skills: SkillState[]): { skills: SkillState[]; events: string[] } {
  const events: string[] = [];
  const next = skills.map((skill) => {
    if (!canRun(robot, skill) || skill.learned[robot.id] === skill.version) return skill;
    events.push(`Learned ${skill.name} v${skill.version}`);
    const versions = skill.versions.map((v, i) => (i === 0 && !v.learnedBy.includes(robot.id) ? { ...v, learnedBy: [...v.learnedBy, robot.id] } : v));
    return { ...skill, versions, learned: { ...skill.learned, [robot.id]: skill.version } };
  });
  return { skills: next, events };
}

export function startSession(skill: SkillState, robots: Robot[], id: string, time: string): TrainingSession {
  const participants = capableRobots(robots, skill).filter(participating);
  return {
    id,
    skillId: skill.id,
    phase: "collecting",
    paused: false,
    startedAt: time,
    baseVersion: skill.version,
    target: SESSION_TARGET,
    episodes: Object.fromEntries(participants.map((r) => [r.id, []])),
    progress: 0,
    result: null,
    publishedVersion: null,
    log: [{ id: 1, text: `Session started. Collecting episodes with v${skill.version} on ${participants.length} robots` }],
  };
}

const total = (session: TrainingSession) => Object.values(session.episodes).reduce((n, list) => n + list.length, 0);
const successes = (session: TrainingSession) => Object.values(session.episodes).reduce((n, list) => n + list.filter(Boolean).length, 0);
export const sessionRate = (session: TrainingSession) => {
  const t = total(session);
  return t ? successes(session) / t : 0;
};
export const sessionTotal = total;

function withLog(session: TrainingSession, ...lines: string[]) {
  let id = (session.log[session.log.length - 1]?.id ?? 0) + 1;
  return [...session.log, ...lines.map((text) => ({ id: id++, text }))].slice(-SESSION_LOG_LIMIT);
}

export type SessionTick = { session: TrainingSession; skill: SkillState; events: [string, string][] };

/** One second of a session. Robots that went offline stop contributing; the session waits for them. */
export function tickSession(session: TrainingSession, skill: SkillState, robots: Robot[], random: () => number): SessionTick {
  const none: SessionTick = { session, skill, events: [] };
  if (session.phase === "published") return none;

  if (session.phase === "collecting") {
    if (session.paused) return none;
    const episodes = { ...session.episodes };
    const lines: string[] = [];
    let count = total(session);
    for (const id of Object.keys(episodes)) {
      const robot = robots.find((r) => r.id === id);
      if (!robot || !participating(robot) || count >= session.target) continue;
      if (random() > 0.55) continue;
      const ok = random() < episodeRate(robot, skill);
      episodes[id] = [...episodes[id], ok];
      count += 1;
      if (!ok && lines.length === 0 && random() < 0.5) lines.push(`${id} episode ${episodes[id].length} failed. Grasp slipped, kept for training`);
      if (count === Math.floor(session.target / 2)) lines.push(`Halfway. ${count} new episodes in the shared dataset`);
    }
    let next: TrainingSession = { ...session, episodes };
    if (count >= session.target) {
      lines.push(`Training v${session.baseVersion + 1} on ${count} episodes from ${Object.keys(episodes).length} robots`);
      next = { ...next, phase: "training", progress: 0 };
    }
    return { session: lines.length ? { ...next, log: withLog(session, ...lines) } : next, skill, events: [] };
  }

  if (session.phase === "training") {
    const progress = Math.min(1, session.progress + 1 / TRAIN_TICKS);
    if (progress < 1) return { session: { ...session, progress }, skill, events: [] };
    return { session: { ...session, phase: "evaluating", progress: 0, log: withLog(session, `Evaluating v${session.baseVersion + 1} on 120 held-out episodes`) }, skill, events: [] };
  }

  // Evaluating.
  const progress = Math.min(1, session.progress + 1 / EVAL_TICKS);
  if (progress < 1) return { session: { ...session, progress }, skill, events: [] };

  const previous = skill.versions[0]?.successRate ?? Math.round(sessionRate(session) * 1000) / 1000;
  const rate = Math.min(0.97, Math.round((previous + 0.025 + random() * 0.035) * 1000) / 1000);
  const version = session.baseVersion + 1;
  const learners = capableRobots(robots, skill);
  const nextSkill: SkillState = {
    ...skill,
    version,
    versions: [{ version, source: "trained", time: "", successRate: rate, previousRate: previous, learnedBy: learners.map((r) => r.id) }, ...skill.versions],
    learned: { ...skill.learned, ...Object.fromEntries(learners.map((r) => [r.id, version])) },
  };
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
  const done: TrainingSession = {
    ...session,
    phase: "published",
    progress: 1,
    result: { rate, previous },
    publishedVersion: version,
    log: withLog(session, `v${version} succeeds ${pct(rate)} of the time, up from ${pct(previous)}`, `Published ${skill.name.toLowerCase()} v${version} back to all ${learners.length} robots`),
  };
  const events: [string, string][] = learners.map((r) => [r.id, `${skill.name} v${version} in use`]);
  return { session: done, skill: nextSkill, events };
}

export const PHASE_LABEL: Record<TrainingSession["phase"], string> = {
  collecting: "Collecting episodes",
  training: "Training",
  evaluating: "Evaluating",
  published: "Published",
};
