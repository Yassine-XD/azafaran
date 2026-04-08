import { Request, Response } from "express";
import { adminService } from "../services/admin.service";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/apiResponse";

export const adminController = {
  // ─── Dashboard ──────────────────────────────────────

  getDashboard: asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.getDashboard();
    return success(res, data);
  }),

  // ─── Products ───────────────────────────────────────

  getProducts: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const active =
      req.query.active !== undefined
        ? req.query.active === "true"
        : undefined;
    const result = await adminService.getProducts({
      page,
      limit,
      search,
      category,
      active,
    });
    return success(res, result.data, 200, result.meta);
  }),

  createProduct: asyncHandler(async (req: Request, res: Response) => {
    const product = await adminService.createProduct(req.body, req.user!.sub);
    return success(res, product, 201);
  }),

  updateProduct: asyncHandler(async (req: Request, res: Response) => {
    const product = await adminService.updateProduct(
      req.params.id,
      req.body,
      req.user!.sub,
    );
    return success(res, product);
  }),

  deleteProduct: asyncHandler(async (req: Request, res: Response) => {
    await adminService.deleteProduct(req.params.id, req.user!.sub);
    return success(res, { message: "Producto desactivado" });
  }),

  addVariant: asyncHandler(async (req: Request, res: Response) => {
    const variant = await adminService.addVariant(
      req.params.id,
      req.body,
      req.user!.sub,
    );
    return success(res, variant, 201);
  }),

  updateVariant: asyncHandler(async (req: Request, res: Response) => {
    const variant = await adminService.updateVariant(
      req.params.id,
      req.params.vid,
      req.body,
      req.user!.sub,
    );
    return success(res, variant);
  }),

  deleteVariant: asyncHandler(async (req: Request, res: Response) => {
    await adminService.deleteVariant(req.params.id, req.params.vid, req.user!.sub);
    return success(res, { message: "Variante eliminada" });
  }),

  // ─── Orders ─────────────────────────────────────────

  getOrders: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await adminService.getOrders({
      page,
      limit,
      status: req.query.status as string | undefined,
      userId: req.query.userId as string | undefined,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
    });
    return success(res, result.data, 200, result.meta);
  }),

  getOrderDetail: asyncHandler(async (req: Request, res: Response) => {
    const order = await adminService.getOrderDetail(req.params.id);
    return success(res, order);
  }),

  updateOrderStatus: asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const order = await adminService.updateOrderStatus(
      req.params.id,
      status,
      req.user!.sub,
    );
    return success(res, order);
  }),

  // ─── Users ──────────────────────────────────────────

  getUsers: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string | undefined;
    const result = await adminService.getUsers({ page, limit, search });
    return success(res, result.data, 200, result.meta);
  }),

  getUserDetail: asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.getUserDetail(req.params.id);
    return success(res, user);
  }),

  updateUser: asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.updateUser(req.params.id, req.body, req.user!.sub);
    return success(res, user);
  }),

  // ─── Promotions ─────────────────────────────────────

  getPromotions: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await adminService.getPromotions(page, limit);
    return success(res, result.data, 200, result.meta);
  }),

  createPromotion: asyncHandler(async (req: Request, res: Response) => {
    const promo = await adminService.createPromotion(req.body, req.user!.sub);
    return success(res, promo, 201);
  }),

  updatePromotion: asyncHandler(async (req: Request, res: Response) => {
    const promo = await adminService.updatePromotion(
      req.params.id,
      req.body,
      req.user!.sub,
    );
    return success(res, promo);
  }),

  deletePromotion: asyncHandler(async (req: Request, res: Response) => {
    await adminService.deletePromotion(req.params.id, req.user!.sub);
    return success(res, { message: "Promoción desactivada" });
  }),

  // ─── Banners ────────────────────────────────────────

  getBanners: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await adminService.getBanners(page, limit);
    return success(res, result.data, 200, result.meta);
  }),

  createBanner: asyncHandler(async (req: Request, res: Response) => {
    const banner = await adminService.createBanner(req.body, req.user!.sub);
    return success(res, banner, 201);
  }),

  updateBanner: asyncHandler(async (req: Request, res: Response) => {
    const banner = await adminService.updateBanner(
      req.params.id,
      req.body,
      req.user!.sub,
    );
    return success(res, banner);
  }),

  deleteBanner: asyncHandler(async (req: Request, res: Response) => {
    await adminService.deleteBanner(req.params.id, req.user!.sub);
    return success(res, { message: "Banner desactivado" });
  }),

  // ─── Promo Codes ────────────────────────────────────

  getPromoCodes: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await adminService.getPromoCodes(page, limit);
    return success(res, result.data, 200, result.meta);
  }),

  createPromoCode: asyncHandler(async (req: Request, res: Response) => {
    const code = await adminService.createPromoCode(req.body, req.user!.sub);
    return success(res, code, 201);
  }),

  updatePromoCode: asyncHandler(async (req: Request, res: Response) => {
    const code = await adminService.updatePromoCode(
      req.params.id,
      req.body,
      req.user!.sub,
    );
    return success(res, code);
  }),

  deletePromoCode: asyncHandler(async (req: Request, res: Response) => {
    await adminService.deletePromoCode(req.params.id, req.user!.sub);
    return success(res, { message: "Código promocional desactivado" });
  }),

  // ─── Delivery Slots ─────────────────────────────────

  getDeliverySlots: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const result = await adminService.getDeliverySlots(page, limit);
    return success(res, result.data, 200, result.meta);
  }),

  createDeliverySlots: asyncHandler(async (req: Request, res: Response) => {
    const { slots } = req.body;
    const created = await adminService.bulkCreateSlots(slots, req.user!.sub);
    return success(res, created, 201);
  }),

  // ─── Audit & Reviews ───────────────────────────────

  getAuditLog: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const result = await adminService.getAuditLogs({
      page,
      limit,
      adminId: req.query.adminId as string | undefined,
      action: req.query.action as string | undefined,
      entity: req.query.entity as string | undefined,
    });
    return success(res, result.data, 200, result.meta);
  }),

  getReviews: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await adminService.getReviews(page, limit);
    return success(res, result.data, 200, result.meta);
  }),

  // ─── Notification Campaigns ─────────────────────────

  getCampaigns: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await adminService.getCampaigns(page, limit);
    return success(res, result.data, 200, result.meta);
  }),

  createCampaign: asyncHandler(async (req: Request, res: Response) => {
    const campaign = await adminService.createCampaign(
      req.body,
      req.user!.sub,
    );
    return success(res, campaign, 201);
  }),

  // ─── Categories ─────────────────────────────────────

  getCategories: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await adminService.getCategories(page, limit);
    return success(res, result.data, 200, result.meta);
  }),

  createCategory: asyncHandler(async (req: Request, res: Response) => {
    const category = await adminService.createCategory(req.body, req.user!.sub);
    return success(res, category, 201);
  }),

  updateCategory: asyncHandler(async (req: Request, res: Response) => {
    const category = await adminService.updateCategory(req.params.id, req.body, req.user!.sub);
    if (!category) return res.status(404).json({ success: false, error: { message: "Categoría no encontrada", code: "CATEGORY_NOT_FOUND" } });
    return success(res, category);
  }),

  deleteCategory: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.deleteCategory(req.params.id, req.user!.sub);
    if (!result) return res.status(404).json({ success: false, error: { message: "Categoría no encontrada", code: "CATEGORY_NOT_FOUND" } });
    return success(res, result);
  }),
};
