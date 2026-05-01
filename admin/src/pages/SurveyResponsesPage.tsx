import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { formatDate } from "../lib/utils";
import { ArrowLeft, Download } from "lucide-react";
import { btnSecondary } from "../components/FormField";

type QuestionType =
  | "text"
  | "single_choice"
  | "multi_choice"
  | "rating"
  | "yes_no"
  | "number";

type Question = {
  id: string;
  type: QuestionType;
  label: string;
  required: boolean;
  options?: string[];
};

type Response = {
  id: string;
  user_id: string;
  user_email: string;
  first_name: string;
  last_name: string;
  answers: Record<string, unknown>;
  submitted_at: string;
};

type Payload = {
  survey: { id: string; title: string; questions: Question[] };
  responses: Response[];
};

function formatAnswer(value: unknown, q: Question): string {
  if (value === undefined || value === null || value === "") return "—";
  if (q.type === "yes_no") return value ? "Sí" : "No";
  if (q.type === "multi_choice" && Array.isArray(value)) return value.join(", ");
  if (q.type === "rating") return `${value} / 5`;
  return String(value);
}

function csvEscape(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export default function SurveyResponsesPage() {
  const { id } = useParams<{ id: string }>();
  const [payload, setPayload] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get<Payload>(`/admin/surveys/${id}/responses?page=${page}&limit=50`)
      .then((r) => {
        if (r.success && r.data) {
          setPayload(r.data);
          setTotalPages(r.meta?.total_pages || 1);
        }
        setLoading(false);
      });
  }, [id, page]);

  const exportCsv = () => {
    if (!payload) return;
    const { survey, responses } = payload;
    const header = [
      "submitted_at",
      "user_email",
      "user_name",
      ...survey.questions.map((q) => q.label || q.id),
    ];
    const rows = responses.map((r) => [
      r.submitted_at,
      r.user_email,
      `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim(),
      ...survey.questions.map((q) => formatAnswer(r.answers[q.id], q)),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((c) => csvEscape(String(c ?? ""))).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `survey-${survey.id}-responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading)
    return <div className="text-sm text-gray-500">Cargando…</div>;
  if (!payload)
    return <div className="text-sm text-gray-500">Encuesta no encontrada</div>;

  const { survey, responses } = payload;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link
            to="/surveys"
            className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 mb-1"
          >
            <ArrowLeft size={14} /> Volver
          </Link>
          <h2 className="text-xl font-bold">{survey.title}</h2>
          <p className="text-sm text-gray-500">{responses.length} respuestas en esta página</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={responses.length === 0}
          className={`${btnSecondary} flex items-center gap-1 disabled:opacity-50`}
        >
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Usuario</th>
              {survey.questions.map((q) => (
                <th key={q.id} className="px-3 py-2 max-w-[200px]">
                  {q.label || q.id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.length === 0 && (
              <tr>
                <td
                  colSpan={2 + survey.questions.length}
                  className="text-center text-gray-400 py-8"
                >
                  Aún no hay respuestas
                </td>
              </tr>
            )}
            {responses.map((r) => (
              <tr key={r.id} className="border-t border-gray-100 align-top">
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                  {formatDate(r.submitted_at)}
                </td>
                <td className="px-3 py-2">
                  <div className="font-medium">
                    {`${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() || "—"}
                  </div>
                  <div className="text-xs text-gray-500">{r.user_email}</div>
                </td>
                {survey.questions.map((q) => (
                  <td key={q.id} className="px-3 py-2 text-gray-700 max-w-[200px] break-words">
                    {formatAnswer(r.answers[q.id], q)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className={`${btnSecondary} disabled:opacity-50`}
          >
            Anterior
          </button>
          <span className="text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className={`${btnSecondary} disabled:opacity-50`}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
