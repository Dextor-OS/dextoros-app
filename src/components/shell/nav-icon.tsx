import {
  Broadcast,
  GearSix,
  GraduationCap,
  Lightning,
  ListBullets,
  Robot,
  Terminal,
} from "@phosphor-icons/react/dist/ssr";
import type { NavItem } from "@/lib/site";

const ICONS = {
  fleet: Robot,
  console: Terminal,
  skills: GraduationCap,
  training: Broadcast,
  rules: Lightning,
  activity: ListBullets,
  settings: GearSix,
} as const;

export function NavIcon({ name, size = 18 }: { name: NavItem["icon"]; size?: number }) {
  const Icon = ICONS[name];
  return <Icon size={size} weight="regular" aria-hidden="true" />;
}
