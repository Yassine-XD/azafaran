import request from "supertest";
import app from "../app";
import { pool } from "../config/database";

let userToken: string;
let userId: string;
let adminToken: string;
let adminId: string;
let surveyId: string;

const stamp = Date.now();

beforeAll(async () => {
  // Regular user
  const userReg = await request(app)
    .post("/api/v1/auth/register")
    .send({
      first_name: "Survey",
      last_name: "User",
      email: `survey_user_${stamp}@test.com`,
      password: "Test1234!",
    });
  userToken = userReg.body.data.accessToken;
  userId = userReg.body.data.user.id;

  // Admin user — register, promote, log in again to get a token with role=admin
  const adminEmail = `survey_admin_${stamp}@test.com`;
  const adminReg = await request(app)
    .post("/api/v1/auth/register")
    .send({
      first_name: "Survey",
      last_name: "Admin",
      email: adminEmail,
      password: "Test1234!",
    });
  adminId = adminReg.body.data.user.id;
  await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [adminId]);

  const adminLogin = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: adminEmail, password: "Test1234!" });
  adminToken = adminLogin.body.data.accessToken;
});

afterAll(async () => {
  if (surveyId) {
    await pool.query("DELETE FROM survey_responses WHERE survey_id = $1", [surveyId]);
    await pool.query("DELETE FROM surveys WHERE id = $1", [surveyId]);
  }
  await pool.query("DELETE FROM refresh_tokens WHERE user_id IN ($1, $2)", [
    userId,
    adminId,
  ]);
  await pool.query("DELETE FROM users WHERE id IN ($1, $2)", [userId, adminId]);
  await pool.end();
});

describe("Surveys", () => {
  it("admin creates a survey (unpublished by default)", async () => {
    const res = await request(app)
      .post("/api/v1/admin/surveys")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Encuesta de prueba",
        description: "Para tests",
        questions: [
          { id: "q1", type: "text", label: "¿Tu nombre?", required: true },
          {
            id: "q2",
            type: "single_choice",
            label: "¿Tu color favorito?",
            options: ["rojo", "azul", "verde"],
            required: true,
          },
          { id: "q3", type: "rating", label: "Valora la app", required: false },
          { id: "q4", type: "yes_no", label: "¿Recomendarías?", required: true },
          { id: "q5", type: "number", label: "¿Edad?", min: 0, max: 120 },
          {
            id: "q6",
            type: "multi_choice",
            label: "¿Qué te interesa?",
            options: ["pollo", "ternera", "cordero"],
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.is_published).toBe(false);
    surveyId = res.body.data.id;
  });

  it("non-admin cannot create surveys", async () => {
    const res = await request(app)
      .post("/api/v1/admin/surveys")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "x", questions: [{ id: "q1", type: "text", label: "?" }] });
    expect(res.status).toBe(403);
  });

  it("user cannot fetch unpublished survey", async () => {
    const res = await request(app)
      .get(`/api/v1/surveys/${surveyId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("SURVEY_NOT_FOUND");
  });

  it("admin publishes the survey", async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/surveys/${surveyId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ is_published: true });
    expect(res.status).toBe(200);
    expect(res.body.data.is_published).toBe(true);
  });

  it("user can fetch published survey and sees not-yet-submitted", async () => {
    const survey = await request(app)
      .get(`/api/v1/surveys/${surveyId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(survey.status).toBe(200);
    expect(survey.body.data.questions).toHaveLength(6);

    const me = await request(app)
      .get(`/api/v1/surveys/${surveyId}/me`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(me.status).toBe(200);
    expect(me.body.data.submitted).toBe(false);
  });

  it("rejects an answer with the wrong type", async () => {
    const res = await request(app)
      .post(`/api/v1/surveys/${surveyId}/responses`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        answers: {
          q1: "Yassine",
          q2: "morado", // not in options
          q4: true,
        },
      });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_ANSWER");
  });

  it("rejects when a required answer is missing", async () => {
    const res = await request(app)
      .post(`/api/v1/surveys/${surveyId}/responses`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ answers: { q1: "Yassine", q2: "azul" } }); // missing q4
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("MISSING_REQUIRED_ANSWER");
  });

  it("accepts a valid submission", async () => {
    const res = await request(app)
      .post(`/api/v1/surveys/${surveyId}/responses`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        answers: {
          q1: "Yassine",
          q2: "azul",
          q3: 5,
          q4: true,
          q5: 30,
          q6: ["pollo", "cordero"],
        },
      });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
  });

  it("returns 409 on duplicate submission", async () => {
    const res = await request(app)
      .post(`/api/v1/surveys/${surveyId}/responses`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ answers: { q1: "x", q2: "azul", q4: true } });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("SURVEY_ALREADY_SUBMITTED");
  });

  it("/me reports submitted=true after a successful response", async () => {
    const me = await request(app)
      .get(`/api/v1/surveys/${surveyId}/me`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(me.status).toBe(200);
    expect(me.body.data.submitted).toBe(true);
  });

  it("admin lists responses for the survey", async () => {
    const res = await request(app)
      .get(`/api/v1/admin/surveys/${surveyId}/responses`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.responses).toHaveLength(1);
    expect(res.body.data.responses[0].answers.q1).toBe("Yassine");
  });

  it("admin can target a survey from a notification campaign", async () => {
    const res = await request(app)
      .post("/api/v1/admin/notifications/send")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Nueva encuesta",
        body: "¡Cuéntanos sobre ti!",
        target: "user",
        target_user_ids: [adminId],
        payload: { type: "survey", surveyId },
      });
    expect(res.status).toBe(201);
    expect(res.body.data.payload.type).toBe("survey");
    expect(res.body.data.payload.surveyId).toBe(surveyId);
  });

  it("notification campaign with an unknown survey id is rejected", async () => {
    const res = await request(app)
      .post("/api/v1/admin/notifications/send")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "x",
        body: "y",
        target: "user",
        target_user_ids: [adminId],
        payload: {
          type: "survey",
          surveyId: "00000000-0000-0000-0000-000000000000",
        },
      });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("SURVEY_NOT_FOUND");
  });
});
