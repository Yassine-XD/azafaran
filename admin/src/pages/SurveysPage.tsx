import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { formatDate } from "../lib/utils";
import DataTable, { type Column } from "../components/DataTable";
import Modal from "../components/Modal";
import FormField, {
  inputClass,
  selectClass,
  btnPrimary,
  btnSecondary,
} from "../components/FormField";
import { Plus, Pencil, Trash2, BarChart3, GripVertical } from "lucide-react";

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
  min?: number;
  max?: number;
};

type Survey = {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
  response_count: number;
};

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  text: "Texto libre",
  single_choice: "Opción única",
  multi_choice: "Opción múltiple",
  rating: "Valoración 1-5",
  yes_no: "Sí / No",
  number: "Número",
};

function nextQid(existing: Question[]): string {
  const used = new Set(existing.map((q) => q.id));
  let i = 1;
  while (used.has(`q${i}`)) i++;
  return `q${i}`;
}

function blankQuestion(existing: Question[]): Question {
  return { id: nextQid(existing), type: "text", label: "", required: false };
}

const emptyForm = {
  title: "",
  description: "",
  is_published: false,
  questions: [] as Question[],
};

export default function SurveysPage() {
  const [data, setData] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Survey | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.get<Survey[]>(`/admin/surveys?page=${page}&limit=20`).then((r) => {
      if (r.success) {
        setData(r.data || []);
        setTotalPages(r.meta?.total_pages || 1);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, [page]);

  const openCreate = () => {
    setEditing(null);
    setErrMsg(null);
    setForm({
      ...emptyForm,
      questions: [blankQuestion([])],
    });
    setModal(true);
  };

  const openEdit = (s: Survey) => {
    setEditing(s);
    setErrMsg(null);
    setForm({
      title: s.title,
      description: s.description || "",
      is_published: s.is_published,
      questions: s.questions,
    });
    setModal(true);
  };

  const updateQuestion = (idx: number, patch: Partial<Question>) => {
    setForm((f) => {
      const qs = [...f.questions];
      qs[idx] = { ...qs[idx], ...patch };
      // When switching to a choice type, ensure options exist.
      if (
        (patch.type === "single_choice" || patch.type === "multi_choice") &&
        !qs[idx].options
      ) {
        qs[idx].options = ["", ""];
      }
      // When switching away from a choice type, drop options.
      if (
        patch.type &&
        patch.type !== "single_choice" &&
        patch.type !== "multi_choice"
      ) {
        delete qs[idx].options;
      }
      return { ...f, questions: qs };
    });
  };

  const moveQuestion = (idx: number, dir: -1 | 1) => {
    setForm((f) => {
      const qs = [...f.questions];
      const j = idx + dir;
      if (j < 0 || j >= qs.length) return f;
      [qs[idx], qs[j]] = [qs[j], qs[idx]];
      return { ...f, questions: qs };
    });
  };

  const removeQuestion = (idx: number) =>
    setForm((f) => ({ ...f, questions: f.questions.filter((_, i) => i !== idx) }));

  const addQuestion = () =>
    setForm((f) => ({ ...f, questions: [...f.questions, blankQuestion(f.questions)] }));

  const validateForm = (): string | null => {
    if (!form.title.trim()) return "El título es obligatorio";
    if (form.questions.length === 0) return "Añade al menos una pregunta";
    const ids = new Set<string>();
    for (const q of form.questions) {
      if (!q.id.trim()) return "Cada pregunta necesita un identificador";
      if (ids.has(q.id)) return `Identificador duplicado: ${q.id}`;
      ids.add(q.id);
      if (!q.label.trim()) return `Pregunta "${q.id}" sin texto`;
      if (q.type === "single_choice" || q.type === "multi_choice") {
        const opts = (q.options || []).map((o) => o.trim()).filter(Boolean);
        if (opts.length < 2)
          return `Pregunta "${q.id}" necesita al menos 2 opciones`;
      }
    }
    return null;
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const err = validateForm();
    if (err) {
      setErrMsg(err);
      return;
    }
    setErrMsg(null);
    setSaving(true);
    const body = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      is_published: form.is_published,
      questions: form.questions.map((q) => {
        const base: Question = {
          id: q.id,
          type: q.type,
          label: q.label.trim(),
          required: q.required,
        };
        if (q.type === "single_choice" || q.type === "multi_choice") {
          base.options = (q.options || []).map((o) => o.trim()).filter(Boolean);
        }
        if (q.type === "number") {
          if (q.min !== undefined) base.min = q.min;
          if (q.max !== undefined) base.max = q.max;
        }
        return base;
      }),
    };
    const res = editing
      ? await api.patch(`/admin/surveys/${editing.id}`, body)
      : await api.post("/admin/surveys", body);
    setSaving(false);
    if (res.success) {
      setModal(false);
      load();
    } else {
      setErrMsg(res.error?.message || "Error al guardar");
    }
  };

  const togglePublish = async (s: Survey) => {
    await api.patch(`/admin/surveys/${s.id}`, { is_published: !s.is_published });
    load();
  };

  const remove = async (s: Survey) => {
    if (!confirm(`¿Eliminar la encuesta "${s.title}" y todas sus respuestas?`))
      return;
    await api.del(`/admin/surveys/${s.id}`);
    load();
  };

  const cols: Column<Survey>[] = [
    {
      key: "title",
      header: "Título",
      render: (r) => <span className="font-medium">{r.title}</span>,
    },
    {
      key: "questions",
      header: "Preguntas",
      render: (r) => r.questions?.length ?? 0,
    },
    {
      key: "response_count",
      header: "Respuestas",
      render: (r) => (
        <Link
          to={`/surveys/${r.id}/responses`}
          className="text-orange-600 hover:underline inline-flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <BarChart3 size={14} /> {r.response_count}
        </Link>
      ),
    },
    {
      key: "is_published",
      header: "Estado",
      render: (r) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePublish(r);
          }}
          className={`px-2 py-0.5 rounded text-xs font-medium ${
            r.is_published
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {r.is_published ? "Publicada" : "Borrador"}
        </button>
      ),
    },
    {
      key: "created_at",
      header: "Creada",
      render: (r) => formatDate(r.created_at),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEdit(r);
            }}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              remove(r);
            }}
            className="p-1.5 hover:bg-gray-100 rounded text-red-600"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Encuestas</h2>
        <button onClick={openCreate} className={`${btnPrimary} flex items-center gap-1`}>
          <Plus size={16} /> Nueva encuesta
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <DataTable
          columns={cols}
          data={data}
          loading={loading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? "Editar encuesta" : "Nueva encuesta"}
        wide
      >
        <form onSubmit={save} className="space-y-4">
          <FormField label="Título">
            <input
              className={inputClass}
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej. Cuéntanos sobre ti"
            />
          </FormField>
          <FormField label="Descripción (opcional)">
            <textarea
              className={inputClass}
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Texto que verá el usuario en la parte superior"
            />
          </FormField>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Preguntas</h3>
            <button
              type="button"
              onClick={addQuestion}
              className={`${btnSecondary} flex items-center gap-1 text-xs`}
            >
              <Plus size={14} /> Añadir pregunta
            </button>
          </div>

          <div className="space-y-3">
            {form.questions.map((q, idx) => (
              <QuestionEditor
                key={q.id + "-" + idx}
                index={idx}
                total={form.questions.length}
                question={q}
                onChange={(patch) => updateQuestion(idx, patch)}
                onRemove={() => removeQuestion(idx)}
                onMove={(dir) => moveQuestion(idx, dir)}
              />
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm pt-2">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) =>
                setForm({ ...form, is_published: e.target.checked })
              }
            />
            Publicar (los usuarios podrán recibirla y responderla)
          </label>

          {errMsg && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {errMsg}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setModal(false)}
              className={btnSecondary}
            >
              Cancelar
            </button>
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function QuestionEditor({
  index,
  total,
  question,
  onChange,
  onRemove,
  onMove,
}: {
  index: number;
  total: number;
  question: Question;
  onChange: (patch: Partial<Question>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const isChoice =
    question.type === "single_choice" || question.type === "multi_choice";

  const updateOption = (optIdx: number, value: string) => {
    const opts = [...(question.options || [])];
    opts[optIdx] = value;
    onChange({ options: opts });
  };
  const addOption = () =>
    onChange({ options: [...(question.options || []), ""] });
  const removeOption = (optIdx: number) =>
    onChange({
      options: (question.options || []).filter((_, i) => i !== optIdx),
    });

  return (
    <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
        <div className="flex items-start gap-2">
          <div className="flex flex-col items-center pt-1 text-gray-400">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMove(-1)}
              className="text-xs disabled:opacity-30"
            >
              ↑
            </button>
            <GripVertical size={14} />
            <button
              type="button"
              disabled={index === total - 1}
              onClick={() => onMove(1)}
              className="text-xs disabled:opacity-30"
            >
              ↓
            </button>
          </div>
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-2">
                <label className="block text-[11px] text-gray-500 mb-0.5">
                  ID
                </label>
                <input
                  className={`${inputClass} text-xs font-mono`}
                  value={question.id}
                  onChange={(e) => onChange({ id: e.target.value })}
                />
              </div>
              <div className="col-span-4">
                <label className="block text-[11px] text-gray-500 mb-0.5">
                  Tipo
                </label>
                <select
                  className={`${selectClass} text-xs`}
                  value={question.type}
                  onChange={(e) =>
                    onChange({ type: e.target.value as QuestionType })
                  }
                >
                  {Object.entries(QUESTION_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-6">
                <label className="block text-[11px] text-gray-500 mb-0.5">
                  Pregunta
                </label>
                <input
                  className={`${inputClass} text-sm`}
                  value={question.label}
                  onChange={(e) => onChange({ label: e.target.value })}
                  placeholder="¿Qué quieres preguntar?"
                />
              </div>
            </div>

            {isChoice && (
              <div className="pl-2 border-l-2 border-orange-200 space-y-1">
                <p className="text-[11px] text-gray-500">Opciones</p>
                {(question.options || []).map((opt, i) => (
                  <div key={i} className="flex gap-1">
                    <input
                      className={`${inputClass} text-xs`}
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Opción ${i + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      className="px-2 text-red-500 hover:bg-red-50 rounded"
                      disabled={(question.options || []).length <= 2}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="text-xs text-orange-600 hover:underline"
                >
                  + Añadir opción
                </button>
              </div>
            )}

            {question.type === "number" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-0.5">
                    Mín
                  </label>
                  <input
                    type="number"
                    className={`${inputClass} text-xs`}
                    value={question.min ?? ""}
                    onChange={(e) =>
                      onChange({
                        min:
                          e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-0.5">
                    Máx
                  </label>
                  <input
                    type="number"
                    className={`${inputClass} text-xs`}
                    value={question.max ?? ""}
                    onChange={(e) =>
                      onChange({
                        max:
                          e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-1.5 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) => onChange({ required: e.target.checked })}
                />
                Obligatoria
              </label>
              <button
                type="button"
                onClick={onRemove}
                className="text-xs text-red-600 hover:underline"
              >
                Eliminar pregunta
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
