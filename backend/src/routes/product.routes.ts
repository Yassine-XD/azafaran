import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { validateBody, validateParams } from "../middleware/validate";
import { productIdSchema, updateProductSchema } from "../validators/product.schema";

const router = Router();

// Public routes — no auth needed
router.get("/", productController.getAll);
router.get("/featured", productController.getFeatured);
router.get("/search", productController.search);
router.get("/:id", validateParams(productIdSchema), productController.getById);
router.get(
  "/:id/variants",
  validateParams(productIdSchema),
  productController.getVariants,
);

router.put(
  "/admin/products/:id",
  // authMiddleware,
  // adminMiddleware,
  validateParams(productIdSchema),
  validateBody(updateProductSchema),
  productController.updateProduct,
);

export default router;
