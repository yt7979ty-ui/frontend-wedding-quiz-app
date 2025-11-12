import React from 'react';
import {
  SparklesIcon, // Aliased to ChampagneIcon
  PlayIcon as HeroPlayIcon, // Aliased to PlayIcon
  ArrowPathIcon, // Aliased to RefreshIcon
  CheckCircleIcon as HeroCheckCircleIcon, // Aliased to CheckCircleIcon
  XCircleIcon as HeroXCircleIcon, // ...
  TrophyIcon as HeroTrophyIcon,
  ClockIcon as HeroClockIcon,
  UserGroupIcon as HeroUserGroupIcon,
  ArrowUturnLeftIcon as HeroArrowUturnLeftIcon,
  EyeIcon as HeroEyeIcon,
  ArchiveBoxIcon, // Aliased to HistoryIcon
  ArrowLeftOnRectangleIcon as HeroArrowLeftOnRectangleIcon,
  ClipboardDocumentListIcon as HeroClipboardDocumentListIcon
} from '@heroicons/react/24/solid';

// ★ 1. props の型定義を（もしなければ）追加
interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

// ★ 2. エイリアス（別名）を使ってエクスポート
// (名前が違うもの)
export const ChampagneIcon = (props: IconProps) => <SparklesIcon {...props} />;
export const RefreshIcon = (props: IconProps) => <ArrowPathIcon {...props} />;
export const HistoryIcon = (props: IconProps) => <ArchiveBoxIcon {...props} />;

// (名前が同じもの - "Hero..." という別名でインポートして使用)
export const PlayIcon = (props: IconProps) => <HeroPlayIcon {...props} />;
export const CheckCircleIcon = (props: IconProps) => <HeroCheckCircleIcon {...props} />;
export const XCircleIcon = (props: IconProps) => <HeroXCircleIcon {...props} />;
export const TrophyIcon = (props: IconProps) => <HeroTrophyIcon {...props} />;
export const ClockIcon = (props: IconProps) => <HeroClockIcon {...props} />;
export const UserGroupIcon = (props: IconProps) => <HeroUserGroupIcon {...props} />;
export const ArrowUturnLeftIcon = (props: IconProps) => <HeroArrowUturnLeftIcon {...props} />;
export const EyeIcon = (props: IconProps) => <HeroEyeIcon {...props} />;
export const ArrowLeftOnRectangleIcon = (props: IconProps) => <HeroArrowLeftOnRectangleIcon {...props} />;
export const ClipboardDocumentListIcon = (props: IconProps) => <HeroClipboardDocumentListIcon {...props} />;