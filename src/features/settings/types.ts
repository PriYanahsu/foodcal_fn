export type SettingLink = {
    label: string;
    description: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    show?: boolean;
  };