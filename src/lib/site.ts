export const site = {
  name: "DextorOS",
  // Production URL of the portal. Override with NEXT_PUBLIC_APP_URL.
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://app.dextoros.app",
  marketingUrl: "https://www.dextoros.app",
  docsUrl: "https://docs.dextoros.app",
  email: "info@dextoros.app",
  title: "DextorOS console",
  description: "Control and teach robots from any maker, in one console.",
  // Host for connector endpoints and the install script. Matches connector_host in ../DEXTOROS/docs/.gitbook/vars.yaml.
  connectorHost: "fleet.dextoros.app",
};

export type NavItem = { href: string; label: string; icon: "fleet" | "console" | "skills" | "training" | "rules" | "activity" | "settings" };

export const navItems: NavItem[] = [
  { href: "/fleet", label: "Fleet", icon: "fleet" },
  { href: "/console", label: "Console", icon: "console" },
  { href: "/skills", label: "Skills", icon: "skills" },
  { href: "/training", label: "Training", icon: "training" },
  { href: "/rules", label: "Rules", icon: "rules" },
  { href: "/activity", label: "Activity", icon: "activity" },
];

export const settingsItems = [
  { href: "/settings/team", label: "Team" },
  { href: "/settings/fleet", label: "Demo fleet" },
  { href: "/settings/profile", label: "Profile" },
];
