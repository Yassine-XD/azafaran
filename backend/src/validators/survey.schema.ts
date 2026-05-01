import { z } from "zod";

// ─── Survey question shape ─────────────────────────────
// Persisted in `surveys.questions` (JSONB). The discriminator is `type`.
// `id` is a stable string the admin generates client-side; user responses key
// answers by this same id.
export const SURVEY_QUESTION_TYPES = [
  "text",
  "single_choice",
  "multi_choice",
  "rating",
  "yes_no",
  "number",
] as const;

export type SurveyQuestionType = (typeof SURVEY_QUESTION_TYPES)[number];

const baseQuestion = {
  id: z.string().min(1).max(100),
  label: z.string().min(1).max(500),
  required: z.boolean().default(false),
};

export const surveyQuestionSchema = z.discriminatedUnion("type", [
  z.object({ ...baseQuestion, type: z.literal("text") }),
  z.object({
    ...baseQuestion,
    type: z.literal("single_choice"),
    options: z.array(z.string().min(1).max(200)).min(2).max(20),
  }),
  z.object({
    ...baseQuestion,
    type: z.literal("multi_choice"),
    options: z.array(z.string().min(1).max(200)).min(2).max(20),
  }),
  z.object({ ...baseQuestion, type: z.literal("rating") }),
  z.object({ ...baseQuestion, type: z.literal("yes_no") }),
  z.object({
    ...baseQuestion,
    type: z.literal("number"),
    min: z.number().optional(),
    max: z.number().optional(),
  }),
]);

export type SurveyQuestion = z.infer<typeof surveyQuestionSchema>;

export const createSurveySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().or(z.literal("").transform(() => undefined)),
  questions: z.array(surveyQuestionSchema).min(1).max(50),
  is_published: z.boolean().optional().default(false),
});

export const updateSurveySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  questions: z.array(surveyQuestionSchema).min(1).max(50).optional(),
  is_published: z.boolean().optional(),
});

// User-submitted answers. Keyed by question id; values are validated against
// the survey's question types inside the service layer (zod can't see the
// parent survey's question definitions at parse time).
export const submitResponseSchema = z.object({
  answers: z.record(z.string(), z.unknown()),
});

export type CreateSurveyInput = z.infer<typeof createSurveySchema>;
export type UpdateSurveyInput = z.infer<typeof updateSurveySchema>;
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
