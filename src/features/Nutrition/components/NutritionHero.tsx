'use client';

import Link from 'next/link';
import { CameraIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { AvatarUpload } from '@/features/userProfile';
import { ThemeDatePicker } from '@/components/ui/ThemeDatePicker';
import { ROUTES } from '@/constants/routes';
import type { NutritionHeroProps } from '../type';
import { ITEM_VARIANTS } from '../utils/Constants';
import { toLocalDate } from '../utils/toLocalDate';

export default function NutritionHero({
  uid,
  avatarUrl,
  userName,
  subtitle,
  selectedDate,
  isToday,
  onAvatarUpload,
  onDateChange,
  onDateSelect,
}: NutritionHeroProps) {
  return (
    <motion.section
      variants={ITEM_VARIANTS}
      className="flex flex-col xl:flex-row justify-between items-stretch xl:items-end gap-3 sm:gap-6 lg:gap-8 mt-1 sm:mt-0"
    >
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 w-full xl:w-auto">
        <motion.div whileHover={{ scale: 1.05 }} className="shrink-0 rounded-full">
          <AvatarUpload
            uid={uid}
            url={avatarUrl}
            isEditing={false}
            onUpload={onAvatarUpload}
            size={96}
          />
        </motion.div>
        <div className="text-center sm:text-left min-w-0 w-full sm:w-auto sm:flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[var(--foreground)] mb-0.5 leading-tight">
            Hello, {userName}
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] font-medium">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full xl:w-auto">
        <div className="flex items-center bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl sm:rounded-2xl p-0.5 sm:p-1 shadow-lg w-full sm:w-auto justify-between sm:justify-start relative z-30 h-10 sm:h-auto">
          <button
            onClick={() => onDateChange(-1)}
            className="p-1.5 sm:p-3 hover:bg-[var(--surface)] rounded-lg sm:rounded-xl transition-colors text-[var(--text-muted)] hover:text-[var(--foreground)] shrink-0"
          >
            <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex-1 sm:flex-none">
            <ThemeDatePicker value={selectedDate} onChange={onDateSelect} max={toLocalDate()} />
          </div>

          <button
            onClick={() => onDateChange(1)}
            disabled={isToday}
            className={`p-1.5 sm:p-3 rounded-lg sm:rounded-xl transition-colors shrink-0 ${isToday ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
          >
            <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <Link href={ROUTES.SCAN}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-14 px-3 sm:px-8 rounded-xl sm:rounded-2xl transition-all w-full sm:w-auto"
          >
            <CameraIcon className="w-4 h-4 sm:w-6 sm:h-6" />
            <span className="font-black tracking-wide text-[11px] sm:text-base">LOG MEAL</span>
          </motion.button>
        </Link>
      </div>
    </motion.section>
  );
}
