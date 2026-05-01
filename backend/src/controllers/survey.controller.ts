import { Request, Response } from "express";
import { surveyService } from "../services/survey.service";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/apiResponse";

export const surveyController = {
  getById: asyncHandler(async (req: Request, res: Response) => {
    const survey = await surveyService.getPublishedSurvey(req.params.id);
    return success(res, {
      id: survey.id,
      title: survey.title,
      description: survey.description,
      questions: survey.questions,
    });
  }),

  getMyStatus: asyncHandler(async (req: Request, res: Response) => {
    const submitted = await surveyService.hasUserResponded(
      req.params.id,
      req.user!.sub,
    );
    return success(res, { submitted });
  }),

  submit: asyncHandler(async (req: Request, res: Response) => {
    const response = await surveyService.submitResponse(
      req.params.id,
      req.user!.sub,
      req.body.answers,
    );
    return success(res, { id: response.id, submitted_at: response.submitted_at }, 201);
  }),
};
