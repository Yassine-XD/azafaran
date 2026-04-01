import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
};

export default function DataTable<T extends Record<string, any>>({
  columns, data, loading, page = 1, totalPages = 1, onPageChange, onRowClick,
}: Props<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((c) => (
                <th key={c.key} className="text-left px-4 py-3 font-medium text-gray-600">{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center py-12 text-gray-400">Sin resultados</td></tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={(row as any).id || i}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3">
                      {c.render ? c.render(row) : String(row[c.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <span className="text-sm text-gray-500">Página {page} de {totalPages}</span>
          <div className="flex gap-1">
            <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30">
              <ChevronLeft size={18} />
            </button>
            <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
