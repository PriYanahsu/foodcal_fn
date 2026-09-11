import { BellIcon, DocumentTextIcon, ShieldCheckIcon, UserCircleIcon } from "@heroicons/react/16/solid";
import { SettingLink } from "../types";
import { isFeatureEnabled } from "@/config";

export const SETTING_LINKS: SettingLink[] = [
    {
      label: 'Edit Profile',
      description: 'Name, goals, body metrics, and photo',
      href: '/profile',
      icon: UserCircleIcon,
      show: isFeatureEnabled('profile'),
    },
    {
      label: 'Notifications',
      description: 'Reminders and push alerts',
      href: '/notifications',
      icon: BellIcon,
      show: isFeatureEnabled('notifications'),
    },
    {
      label: 'Privacy Policy',
      description: 'How we handle your data',
      href: '/privacy',
      icon: ShieldCheckIcon,
      show: true,
    },
    {
      label: 'Terms of Service',
      description: 'Rules for using FoodCal',
      href: '/terms',
      icon: DocumentTextIcon,
      show: true,
    },
  ];