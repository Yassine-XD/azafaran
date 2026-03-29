import { Router } from "express";
import { categoryController } from "../controllers/category.controller";

const router = Router();

// Public routes — no auth needed
router.get("/", categoryController.getAll);
router.get("/:slug/products", categoryController.getProductsByCategory);

export default router;
