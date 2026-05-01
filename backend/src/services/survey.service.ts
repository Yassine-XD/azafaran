import { surveyRepository, StoredSurvey } from "../repositories/survey.repository";
import { SurveyQuestion } from "../validators/survey.schema";

function appError(message: string, statusCode: number, code: string) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

// Validate one answer against its question definition.
// Throws an appError(400, INVALID_ANSWER) on mismatch.
function validateAnswer(question: SurveyQuestion, raw: unknown) {
  const fail = (msg: string) =>
    appError(`${msg} (${question.id})`, 400, "INVALID_ANSWER");

  switch (question.type) {
    case "text": {
      if (typeof raw !== "string") throw fail("Respuesta debe ser texto");
      if (question.required && raw.trim().length === 0)
        throw fail("Respuesta obligatoria");
      return raw;
    }
    case "number": {
      if (typeof raw !== "number" || Number.isNaN(raw))
        throw fail("Respuesta debe ser un número");
      if (question.min !== undefined && raw < question.min)
        throw fail(`Mínimo ${question.min}`);
      if (question.max !== undefined && raw > question.max)
        throw fail(`Máximo ${question.max}`);
      return raw;
    }
    case "yes_no": {
      if (typeof raw !== "boolean") throw fail("Respuesta debe ser sí/no");
      return raw;
    }
    case "rating": {
      if (typeof raw !== "number" || !Number.isInteger(raw) || raw < 1 || raw > 5)
        throw fail("Valoración debe estar entre 1 y 5");
      return raw;
    }
    case "single_choice": {
      if (typeof raw !== "string") throw fail("Selecciona una opción");
      if (!question.options.includes(raw)) throw fail("Opción inválida");
      return raw;
    }
    case "multi_choice": {
      if (!Array.isArray(raw) || raw.some((v) => typeof v !== "string"))
        throw fail("Selecciona una o varias opciones");
      const set = new Set(raw as string[]);
      for (const v of set) {
        if (!question.options.includes(v)) throw fail("Opción inválida");
      }
      if (question.required && set.size === 0)
        throw fail("Respuesta obligatoria");
      return Array.from(set);
    }
  }
}

export const surveyService = {
  async getPublishedSurvey(id: string): Promise<StoredSurvey> {
    const survey = await surveyRepository.findById(id);
    if (!survey || !survey.is_published) {
      throw appError("Encuesta no encontrada", 404, "SURVEY_NOT_FOUND");
    }
    return survey;
  },

  async hasUserResponded(surveyId: string, userId: string) {
    const survey = await surveyRepository.findById(surveyId);
    if (!survey) {
      throw appError("Encuesta no encontrada", 404, "SURVEY_NOT_FOUND");
    }
    return surveyRepository.hasUserResponded(surveyId, userId);
  },

  async submitResponse(
    surveyId: string,
    userId: string,
    rawAnswers: Record<string, unknown>,
  ) {
    const survey = await surveyRepository.findById(surveyId);
    if (!survey || !survey.is_published) {
      throw appError("Encuesta no encontrada", 404, "SURVEY_NOT_FOUND");
    }

    const already = await surveyRepository.hasUserResponded(surveyId, userId);
    if (already) {
      throw appError(
        "Ya has respondido a esta encuesta",
        409,
        "SURVEY_ALREADY_SUBMITTED",
      );
    }

    const questions: SurveyQuestion[] = survey.questions;
    const cleaned: Record<string, unknown> = {};

    for (const q of questions) {
      const raw = rawAnswers[q.id];
      if (raw === undefined || raw === null) {
        if (q.required) {
          throw appError(
            `Falta respuesta obligatoria (${q.id})`,
            400,
            "MISSING_REQUIRED_ANSWER",
          );
        }
        continue;
      }
      cleaned[q.id] = validateAnswer(q, raw);
    }

    return surveyRepository.createResponse(surveyId, userId, cleaned);
  },
};
