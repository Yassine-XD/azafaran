import { userRepository } from "../repositories/user.repository";
import type {
  UpdateProfileInput,
  CreateAddressInput,
  UpdateAddressInput,
} from "../validators/user.schema";

function appError(message: string, statusCode: number, code: string) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

// Strip sensitive fields before returning user
function sanitizeUser(user: any) {
  const { password_hash, ...safe } = user;
  return safe;
}

export const userService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw appError("Usuario no encontrado", 404, "USER_NOT_FOUND");
    return sanitizeUser(user);
  },

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const updated = await userRepository.update(userId, data);
    if (!updated)
      throw appError("Usuario no encontrado", 404, "USER_NOT_FOUND");
    return sanitizeUser(updated);
  },

  async deleteAccount(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw appError("Usuario no encontrado", 404, "USER_NOT_FOUND");

    // Revoke all sessions
    await userRepository.deleteAllRefreshTokens(userId);

    // Soft delete + anonymize
    await userRepository.softDelete(userId);
  },

  // ─── Addresses ──────────────────────────────────────

  async getAddresses(userId: string) {
    return userRepository.findAddressesByUserId(userId);
  },

  async addAddress(userId: string, data: CreateAddressInput) {
    // Max 5 addresses per user
    const count = await userRepository.countAddresses(userId);
    if (count >= 5) {
      throw appError(
        "Máximo 5 direcciones permitidas",
        400,
        "MAX_ADDRESSES_REACHED",
      );
    }

    return userRepository.createAddress(userId, data);
  },

  async updateAddress(
    userId: string,
    addressId: string,
    data: UpdateAddressInput,
  ) {
    const existing = await userRepository.findAddressById(addressId, userId);
    if (!existing)
      throw appError("Dirección no encontrada", 404, "ADDRESS_NOT_FOUND");

    const updated = await userRepository.updateAddress(addressId, userId, data);
    if (!updated)
      throw appError("Dirección no encontrada", 404, "ADDRESS_NOT_FOUND");
    return updated;
  },

  async setDefaultAddress(userId: string, addressId: string) {
    const existing = await userRepository.findAddressById(addressId, userId);
    if (!existing)
      throw appError("Dirección no encontrada", 404, "ADDRESS_NOT_FOUND");

    await userRepository.setDefaultAddress(addressId, userId);
  },

  async deleteAddress(userId: string, addressId: string) {
    const existing = await userRepository.findAddressById(addressId, userId);
    if (!existing)
      throw appError("Dirección no encontrada", 404, "ADDRESS_NOT_FOUND");

    // Block delete if address has active orders
    const hasOrders = await userRepository.hasActiveOrders(addressId);
    if (hasOrders) {
      throw appError(
        "No puedes eliminar una dirección con pedidos activos",
        400,
        "ADDRESS_HAS_ACTIVE_ORDERS",
      );
    }

    await userRepository.deleteAddress(addressId, userId);
  },
};
