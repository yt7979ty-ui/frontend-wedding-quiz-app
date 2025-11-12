import React from 'react';
import {
  SparklesIcon, 
  PlayIcon as HeroPlayIcon, 
  ArrowPathIcon, 
  CheckCircleIcon as HeroCheckCircleIcon, 
  XCircleIcon as HeroXCircleIcon, 
  TrophyIcon as HeroTrophyIcon,
  ClockIcon as HeroClockIcon,
  UserGroupIcon as HeroUserGroupIcon,
  ArrowUturnLeftIcon as HeroArrowUturnLeftIcon,
  EyeIcon as HeroEyeIcon,
  ArchiveBoxIcon, 
  ArrowLeftOnRectangleIcon as HeroArrowLeftOnRectangleIcon,
  ClipboardDocumentListIcon as HeroClipboardDocumentListIcon,
  TrashIcon as HeroTrashIcon // ★ 1. TrashIcon をインポート
} from '@heroicons/react/24/solid';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

// ( ... 他のアイコンは変更なし ... )
export const ChampagneIcon = (props: IconProps) => <SparklesIcon {...props} />;
export const PlayIcon = (props: IconProps) => <HeroPlayIcon {...props} />;
export const RefreshIcon = (props: IconProps) => <ArrowPathIcon {...props} />;
export const CheckCircleIcon = (props: IconProps) => <HeroCheckCircleIcon {...props} />;
export const XCircleIcon = (props: IconProps) => <HeroXCircleIcon {...props} />;
export const TrophyIcon = (props: IconProps) => <HeroTrophyIcon {...props} />;
export const ClockIcon = (props: IconProps) => <HeroClockIcon {...props} />;
export const UserGroupIcon = (props: IconProps) => <HeroUserGroupIcon {...props} />;
export const ArrowUturnLeftIcon = (props: IconProps) => <HeroArrowUturnLeftIcon {...props} />;
export const EyeIcon = (props: IconProps) => <HeroEyeIcon {...props} />;
export const HistoryIcon = (props: IconProps) => <ArchiveBoxIcon {...props} />;
export const ArrowLeftOnRectangleIcon = (props: IconProps) => <HeroArrowLeftOnRectangleIcon {...props} />;
export const ClipboardDocumentListIcon = (props: IconProps) => <HeroClipboardDocumentListIcon {...props} />;

// ★ 2. TrashIcon をエクスポート
export const TrashIcon = (props: IconProps) => <HeroTrashIcon {...props} />;