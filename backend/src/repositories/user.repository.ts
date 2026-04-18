import { pool } from "../config/database";
import { v4 as uuidv4 } from "uuid";
import type {
  CreateAddressInput,
  UpdateAddressInput,
  UpdateProfileInput,
} from "../validators/user.schema";

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: "customer" | "admin";
  is_verified: boolean;
  is_active: boolean;
  family_size: number | null;
  preferred_lang: string;
  created_at: Date;
  updated_at: Date;
}

export interface AddressRow {
  id: string;
  user_id: string;
  label: string;
  street: string;
  city: string;
  postcode: string;
  province: string;
  country: string;
  instructions: string | null;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export const userRepository = {
  // ─── User queries ─────────────────────────────────

  async findByEmail(email: string): Promise<UserRow | null> {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND is_active = true",
      [email],
    );
    return rows[0] || null;
  },

  async findById(id: string): Promise<UserRow | null> {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    return rows[0] || null;
  },

  async create(data: {
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
    phone?: string;
    preferred_lang?: string;
  }): Promise<UserRow> {
    const { rows } = await pool.query(
      `INSERT INTO users (id, first_name, last_name, email, password_hash, phone, role, preferred_lang)
       VALUES ($1, $2, $3, $4, $5, $6, 'customer', $7)
       RETURNING *`,
      [
        uuidv4(),
        data.first_name,
        data.last_name,
        data.email,
        data.password_hash,
        data.phone || null,
        data.preferred_lang || "es",
      ],
    );
    return rows[0];
  },

  async update(id: string, data: UpdateProfileInput): Promise<UserRow | null> {
    // Build dynamic SET clause — only update provided fields
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.first_name !== undefined) {
      fields.push(`first_name = $${idx++}`);
      values.push(data.first_name);
    }
    if (data.last_name !== undefined) {
      fields.push(`last_name = $${idx++}`);
      values.push(data.last_name);
    }
    if (data.phone !== undefined) {
      fields.push(`phone = $${idx++}`);
      values.push(data.phone);
    }
    if (data.family_size !== undefined) {
      fields.push(`family_size = $${idx++}`);
      values.push(data.family_size);
    }
    if (data.preferred_lang !== undefined) {
      fields.push(`preferred_lang = $${idx++}`);
      values.push(data.preferred_lang);
    }
    if (data.gender !== undefined) {
      fields.push(`gender = $${idx++}`);
      values.push(data.gender);
    }
    if (data.date_of_birth !== undefined) {
      fields.push(`date_of_birth = $${idx++}`);
      values.push(data.date_of_birth);
    }
    if (data.accepts_terms !== undefined) {
      fields.push(`accepts_terms = $${idx++}`);
      values.push(data.accepts_terms);
    }
    if (data.accepts_marketing !== undefined) {
      fields.push(`accepts_marketing = $${idx++}`);
      values.push(data.accepts_marketing);
    }

    if (fields.length === 0) return userRepository.findById(id);

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return rows[0] || null;
  },

  async softDelete(id: string): Promise<void> {
    // Anonymize PII on delete — GDPR compliant
    await pool.query(
      `UPDATE users SET
        is_active     = false,
        email         = $1,
        first_name    = 'Deleted',
        last_name     = 'User',
        phone         = null,
        password_hash = null
       WHERE id = $2`,
      [`deleted_${id}@azafaran.es`, id],
    );
  },

  // ─── Refresh token queries ─────────────────────────

  async saveRefreshToken(data: {
    userId: string;
    tokenHash: string;
    deviceInfo?: object;
    expiresAt: Date;
  }): Promise<void> {
    await pool.query(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, device_info, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        uuidv4(),
        data.userId,
        data.tokenHash,
        JSON.stringify(data.deviceInfo || {}),
        data.expiresAt,
      ],
    );
  },

  async findRefreshToken(
    tokenHash: string,
  ): Promise<{ id: string; user_id: string } | null> {
    const { rows } = await pool.query(
      `SELECT id, user_id FROM refresh_tokens
       WHERE token_hash = $1 AND expires_at > NOW()`,
      [tokenHash],
    );
    return rows[0] || null;
  },

  async deleteRefreshToken(tokenHash: string): Promise<void> {
    await pool.query("DELETE FROM refresh_tokens WHERE token_hash = $1", [
      tokenHash,
    ]);
  },

  async deleteAllRefreshTokens(userId: string): Promise<void> {
    await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);
  },

  // ─── Address queries ───────────────────────────────

  async findAddressesByUserId(userId: string): Promise<AddressRow[]> {
    const { rows } = await pool.query(
      "SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at ASC",
      [userId],
    );
    return rows;
  },

  async findAddressById(
    id: string,
    userId: string,
  ): Promise<AddressRow | null> {
    const { rows } = await pool.query(
      "SELECT * FROM addresses WHERE id = $1 AND user_id = $2",
      [id, userId],
    );
    return rows[0] || null;
  },

  async countAddresses(userId: string): Promise<number> {
    const { rows } = await pool.query(
      "SELECT COUNT(*) FROM addresses WHERE user_id = $1",
      [userId],
    );
    return parseInt(rows[0].count, 10);
  },

  async createAddress(
    userId: string,
    data: CreateAddressInput,
  ): Promise<AddressRow> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // If this is the default, remove default from others first
      if (data.is_default) {
        await client.query(
          "UPDATE addresses SET is_default = false WHERE user_id = $1",
          [userId],
        );
      }

      const { rows } = await client.query(
        `INSERT INTO addresses
           (id, user_id, label, street, city, postcode, province, country, instructions, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          uuidv4(),
          userId,
          data.label,
          data.street,
          data.city,
          data.postcode,
          data.province,
          data.country,
          data.instructions || null,
          data.is_default,
        ],
      );

      await client.query("COMMIT");
      return rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async updateAddress(
    id: string,
    userId: string,
    data: UpdateAddressInput,
  ): Promise<AddressRow | null> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      if (data.is_default) {
        await client.query(
          "UPDATE addresses SET is_default = false WHERE user_id = $1",
          [userId],
        );
      }

      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (data.label !== undefined) {
        fields.push(`label = $${idx++}`);
        values.push(data.label);
      }
      if (data.street !== undefined) {
        fields.push(`street = $${idx++}`);
        values.push(data.street);
      }
      if (data.city !== undefined) {
        fields.push(`city = $${idx++}`);
        values.push(data.city);
      }
      if (data.postcode !== undefined) {
        fields.push(`postcode = $${idx++}`);
        values.push(data.postcode);
      }
      if (data.province !== undefined) {
        fields.push(`province = $${idx++}`);
        values.push(data.province);
      }
      if (data.country !== undefined) {
        fields.push(`country = $${idx++}`);
        values.push(data.country);
      }
      if (data.instructions !== undefined) {
        fields.push(`instructions = $${idx++}`);
        values.push(data.instructions);
      }
      if (data.is_default !== undefined) {
        fields.push(`is_default = $${idx++}`);
        values.push(data.is_default);
      }

      if (fields.length === 0) {
        await client.query("COMMIT");
        return userRepository.findAddressById(id, userId);
      }

      values.push(id, userId);
      const { rows } = await client.query(
        `UPDATE addresses SET ${fields.join(", ")}
         WHERE id = $${idx} AND user_id = $${idx + 1}
         RETURNING *`,
        values,
      );

      await client.query("COMMIT");
      return rows[0] || null;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async setDefaultAddress(id: string, userId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "UPDATE addresses SET is_default = false WHERE user_id = $1",
        [userId],
      );
      await client.query(
        "UPDATE addresses SET is_default = true WHERE id = $1 AND user_id = $2",
        [id, userId],
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async deleteAddress(id: string, userId: string): Promise<boolean> {
    const { rowCount } = await pool.query(
      "DELETE FROM addresses WHERE id = $1 AND user_id = $2",
      [id, userId],
    );
    return (rowCount ?? 0) > 0;
  },

  async hasActiveOrders(addressId: string): Promise<boolean> {
    const { rows } = await pool.query(
      `SELECT COUNT(*) FROM orders
       WHERE address_id = $1
       AND status NOT IN ('delivered', 'cancelled', 'refunded')`,
      [addressId],
    );
    return parseInt(rows[0].count, 10) > 0;
  },
};
