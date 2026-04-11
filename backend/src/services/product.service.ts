import { productRepository } from "../repositories/product.repository";
import type {
  ListProductsInput,
  UpdateProductInput,
} from "../validators/product.schema";

function appError(message: string, statusCode: number, code: string) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

// Format price fields from string to number
function formatProduct(product: any) {
  return {
    ...product,
    price_per_kg: parseFloat(product.price_per_kg),
    variants: product.variants?.map((v: any) => ({
      ...v,
      price: parseFloat(v.price),
    })),
  };
}

export const productService = {
  async getAll(input: ListProductsInput) {
    const { rows, total } = await productRepository.findAll(input);

    return {
      products: rows.map(formatProduct),
      meta: {
        total,
        page: input.page,
        limit: input.limit,
        total_pages: Math.ceil(total / input.limit),
      },
    };
  },

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product)
      throw appError("Producto no encontrado", 404, "PRODUCT_NOT_FOUND");
    return formatProduct(product);
  },

  async getFeatured() {
    const [featured, bestsellers] = await Promise.all([
      productRepository.findFeatured(),
      productRepository.findBestsellers(),
    ]);

    return {
      featured: featured.map(formatProduct),
      bestsellers: bestsellers.map(formatProduct),
    };
  },

  async search(query: string) {
    if (!query || query.trim().length < 2) {
      throw appError(
        "La búsqueda debe tener al menos 2 caracteres",
        400,
        "QUERY_TOO_SHORT",
      );
    }

    const results = await productRepository.searchProducts(query.trim());
    return results.map(formatProduct);
  },

  async updateProduct(productId: string, input: UpdateProductInput) {
    // 1. Check product exists
    const existingProduct = await productRepository.findById(productId);
    if (!existingProduct) {
      throw appError("Producto no encontrado", 404, "PRODUCT_NOT_FOUND");
    }

    // 2. Business rules / validations

    // Slug uniqueness (if updating slug)
    if (input.slug && input.slug !== existingProduct.slug) {
      const existingSlug = await productRepository.findBySlug(input.slug);
      if (existingSlug) {
        throw appError("El slug ya está en uso", 400, "SLUG_ALREADY_EXISTS");
      }
    }

    // Optional: prevent invalid unit_type transitions
    if (input.unit_type && input.unit_type !== existingProduct.unit_type) {
      // Example rule: block changing pack type if it has pack_items
      if (
        existingProduct.unit_type === "pack" &&
        existingProduct.pack_items?.length
      ) {
        throw appError(
          "No se puede cambiar el tipo de un producto pack con items",
          400,
          "INVALID_UNIT_TYPE_CHANGE",
        );
      }
    }

    // Optional: price validation
    if (input.price_per_kg && parseFloat(input.price_per_kg) <= 0) {
      throw appError("El precio debe ser mayor que 0", 400, "INVALID_PRICE");
    }

    // 3. Update product
    const updatedProduct = await productRepository.updateProduct(
      productId,
      input,
    );

    if (!updatedProduct) {
      throw appError("Error al actualizar el producto", 500, "UPDATE_FAILED");
    }

    // 4. Return formatted result
    return formatProduct(updatedProduct);
  },

  async getVariants(productId: string) {
    const product = await productRepository.findById(productId);
    if (!product)
      throw appError("Producto no encontrado", 404, "PRODUCT_NOT_FOUND");

    return product.variants.map((v: any) => ({
      ...v,
      price: parseFloat(v.price),
    }));
  },
};
