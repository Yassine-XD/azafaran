import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate } from "../middleware/authenticate";
import { validateBody } from "../middleware/validate";
import {
  updateProfileSchema,
  createAddressSchema,
  updateAddressSchema,
} from "../validators/user.schema";

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Profile
router.get("/", userController.getProfile);
router.put(
  "/",
  validateBody(updateProfileSchema),
  userController.updateProfile,
);
router.delete("/", userController.deleteAccount);

// Addresses
router.get("/addresses", userController.getAddresses);
router.post(
  "/addresses",
  validateBody(createAddressSchema),
  userController.addAddress,
);
router.put(
  "/addresses/:id",
  validateBody(updateAddressSchema),
  userController.updateAddress,
);
router.patch("/addresses/:id/default", userController.setDefaultAddress);
router.delete("/addresses/:id", userController.deleteAddress);

export default router;
