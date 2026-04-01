import type { ReactNode } from "react";

type Props = { label: string; children: ReactNode; error?: string };

export default function FormField({ label, children, error }: Props) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent";
export const selectClass = inputClass;
export const btnPrimary = "bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50";
export const btnSecondary = "border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50";
