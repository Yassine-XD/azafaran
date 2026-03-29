import { productRepository } from "../repositories/product.repository";
import type { ListProductsInput } from "../validators/product.schema";

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
