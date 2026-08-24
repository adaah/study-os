import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    text: string;
    positive?: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  iconColor = 'text-slate-600',
  trend,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`academic-card p-3.5 flex flex-col justify-between h-full min-h-[96px] transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-xs hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate" title={label}>
          {label}
        </span>
        <div className={`p-1.5 rounded-md bg-slate-50 border border-slate-200/80 shrink-0 ${iconColor}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 leading-none">
            {value}
          </span>
          {subValue && (
            <span className="text-[10px] text-slate-400 font-medium truncate">
              {subValue}
            </span>
          )}
        </div>

        {trend && (
          <div className="mt-1 flex items-center gap-1 text-[10px]">
            <span className={trend.positive ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
              {trend.text}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
