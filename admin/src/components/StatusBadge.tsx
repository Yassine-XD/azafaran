const COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-orange-100 text-orange-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
  draft: "bg-gray-100 text-gray-600",
  scheduled: "bg-blue-100 text-blue-800",
  sent: "bg-green-100 text-green-800",
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-600",
};

export default function StatusBadge({ status }: { status: string }) {
  const color = COLORS[status] || "bg-gray-100 text-gray-800";
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
}
