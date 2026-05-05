import type { LucideIcon } from "lucide-react";

type Delta = { text: string; positive: boolean; neutral?: boolean };

type Props = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  subtitle?: string;
  delta?: Delta;
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  delta,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 truncate">{title}</p>
          <p className="text-2xl font-bold mt-1 truncate">{value}</p>
          {(subtitle || delta) && (
            <div className="flex items-center gap-2 mt-1">
              {delta && (
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                    delta.neutral
                      ? "bg-gray-100 text-gray-600"
                      : delta.positive
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {delta.text}
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-gray-500 truncate">{subtitle}</span>
              )}
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
        >
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
}
