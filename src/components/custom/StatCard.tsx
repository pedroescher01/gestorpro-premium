import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export default function StatCard({ title, value, icon: Icon, trend, subtitle }: StatCardProps) {
  return (
    <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6 hover:border-[#00E5FF]/30 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-inter mb-2">{title}</p>
          <h3 className="text-3xl font-inter font-bold text-white mb-1">{value}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500">vs mês anterior</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center group-hover:bg-[#00E5FF]/20 transition-all">
          <Icon className="w-6 h-6 text-[#00E5FF]" />
        </div>
      </div>
    </div>
  );
}
