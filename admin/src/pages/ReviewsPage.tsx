import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { formatDate } from "../lib/utils";
import DataTable, { type Column } from "../components/DataTable";
import { Star } from "lucide-react";

type Review = {
  id: string; first_name: string; last_name: string;
  order_number: string; rating: number; comment: string; created_at: string;
};

export default function ReviewsPage() {
  const [data, setData] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/reviews?page=${page}&limit=20`).then((r) => {
      if (r.success) { setData(r.data as any || []); setTotalPages(r.meta?.total_pages || 1); }
      setLoading(false);
    });
  }, [page]);

  const cols: Column<Review>[] = [
    { key: "customer", header: "Cliente", render: (r) => `${r.first_name} ${r.last_name}` },
    { key: "order_number", header: "Pedido" },
    {
      key: "rating", header: "Valoración", render: (r) => (
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={14} className={s <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
          ))}
        </div>
      ),
    },
    { key: "comment", header: "Comentario" },
    { key: "created_at", header: "Fecha", render: (r) => formatDate(r.created_at) },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Reseñas</h2>
      <div className="bg-white rounded-xl border border-gray-200">
        <DataTable columns={cols} data={data} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
