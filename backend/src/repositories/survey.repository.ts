import { pool } from "../config/database";
import {
  CreateSurveyInput,
  UpdateSurveyInput,
  SurveyQuestion,
} from "../validators/survey.schema";

export const surveyRepository = {
  async findAll(filters: { page: number; limit: number; published?: boolean }) {
    const offset = (filters.page - 1) * filters.limit;
    const where: string[] = [];
    const params: any[] = [];
    if (filters.published !== undefined) {
      params.push(filters.published);
      where.push(`is_published = $${params.length}`);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [{ rows }, { rows: countRows }] = await Promise.all([
      pool.query(
        `SELECT s.*,
                (SELECT COUNT(*)::int FROM survey_responses r WHERE r.survey_id = s.id) AS response_count
           FROM surveys s
           ${whereSql}
           ORDER BY s.created_at DESC
           LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, filters.limit, offset],
      ),
      pool.query(`SELECT COUNT(*)::int AS total FROM surveys ${whereSql}`, params),
    ]);

    return { rows, total: countRows[0].total as number };
  },

  async findById(id: string) {
    const { rows } = await pool.query(
      `SELECT s.*,
              (SELECT COUNT(*)::int FROM survey_responses r WHERE r.survey_id = s.id) AS response_count
         FROM surveys s
         WHERE s.id = $1`,
      [id],
    );
    return rows[0] || null;
  },

  async create(data: CreateSurveyInput) {
    const { rows } = await pool.query(
      `INSERT INTO surveys (title, description, questions, is_published)
         VALUES ($1, $2, $3::jsonb, $4)
         RETURNING *`,
      [
        data.title,
        data.description ?? null,
        JSON.stringify(data.questions),
        data.is_published ?? false,
      ],
    );
    return rows[0];
  },

  async update(id: string, data: UpdateSurveyInput) {
    const sets: string[] = [];
    const values: any[] = [];
    if (data.title !== undefined) {
      values.push(data.title);
      sets.push(`title = $${values.length}`);
    }
    if (data.description !== undefined) {
      values.push(data.description);
      sets.push(`description = $${values.length}`);
    }
    if (data.questions !== undefined) {
      values.push(JSON.stringify(data.questions));
      sets.push(`questions = $${values.length}::jsonb`);
    }
    if (data.is_published !== undefined) {
      values.push(data.is_published);
      sets.push(`is_published = $${values.length}`);
    }
    if (sets.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE surveys SET ${sets.join(", ")} WHERE id = $${values.length} RETURNING *`,
      values,
    );
    return rows[0] || null;
  },

  async remove(id: string) {
    const { rows } = await pool.query(
      "DELETE FROM surveys WHERE id = $1 RETURNING id",
      [id],
    );
    return rows[0] || null;
  },

  async hasUserResponded(surveyId: string, userId: string): Promise<boolean> {
    const { rows } = await pool.query(
      "SELECT 1 FROM survey_responses WHERE survey_id = $1 AND user_id = $2 LIMIT 1",
      [surveyId, userId],
    );
    return rows.length > 0;
  },

  async createResponse(
    surveyId: string,
    userId: string,
    answers: Record<string, unknown>,
  ) {
    const { rows } = await pool.query(
      `INSERT INTO survey_responses (survey_id, user_id, answers)
         VALUES ($1, $2, $3::jsonb)
         RETURNING *`,
      [surveyId, userId, JSON.stringify(answers)],
    );
    return rows[0];
  },

  async findResponsesBySurvey(
    surveyId: string,
    filters: { page: number; limit: number },
  ) {
    const offset = (filters.page - 1) * filters.limit;
    const [{ rows }, { rows: countRows }] = await Promise.all([
      pool.query(
        `SELECT r.id, r.survey_id, r.user_id, r.answers, r.submitted_at,
                u.email AS user_email, u.first_name, u.last_name
           FROM survey_responses r
           JOIN users u ON u.id = r.user_id
           WHERE r.survey_id = $1
           ORDER BY r.submitted_at DESC
           LIMIT $2 OFFSET $3`,
        [surveyId, filters.limit, offset],
      ),
      pool.query(
        "SELECT COUNT(*)::int AS total FROM survey_responses WHERE survey_id = $1",
        [surveyId],
      ),
    ]);
    return { rows, total: countRows[0].total as number };
  },
};

export type StoredSurvey = {
  id: string;
  title: string;
  description: string | null;
  questions: SurveyQuestion[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
  response_count?: number;
};
