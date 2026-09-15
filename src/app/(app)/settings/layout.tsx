import { SettingsTabs } from "@/components/shell/settings-tabs";

export default function SettingsLayout({ children }: LayoutProps<"/settings">) {
  return (
    <>
      <SettingsTabs />
      {children}
    </>
  );
}
