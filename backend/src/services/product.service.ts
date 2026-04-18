import { productRepository } from "../repositories/product.repository";
import { resolveI18n } from "../utils/i18n";
import type {
  ListProductsInput,
  UpdateProductInput,
} from "../validators/product.schema";

function formatProduct(product: any, lang = 'es') {
  return {
    ...product,
    name: resolveI18n(product.name_i18n, product.name, lang),
    description: resolveI18n(product.description_i18n, product.description, lang),
    short_desc: resolveI18n(product.short_desc_i18n, product.short_desc, lang),
    price_per_kg: parseFloat(product.price_per_kg),
    variants: product.variants?.map((v: any) => ({
      ...v,
      label: resolveI18n(v.label_i18n, v.label, lang),
      price: parseFloat(v.price),
    })),
    // Pack items: resolve product names inside packs
    pack_items: product.pack_items?.map((pi: any) => ({
      ...pi,
      product_name: resolveI18n(pi.product_name_i18n, pi.product_name, lang),
    })),
  };
}

function appError(message: string, statusCode: number, code: string) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

export const productService = {
  async getAll(input: ListProductsInput, lang = 'es') {
    const { rows, total } = await productRepository.findAll(input);

    return {
      products: rows.map((p) => formatProduct(p, lang)),
      meta: {
        total,
        page: input.page,
        limit: input.limit,
        total_pages: Math.ceil(total / input.limit),
      },
    };
  },

  async getById(id: string, lang = 'es') {
    const product = await productRepository.findById(id);
    if (!product)
      throw appError("Producto no encontrado", 404, "PRODUCT_NOT_FOUND");
    return formatProduct(product, lang);
  },

  async getFeatured(lang = 'es') {
    const [featured, bestsellers] = await Promise.all([
      productRepository.findFeatured(),
      productRepository.findBestsellers(),
    ]);

    return {
      featured: featured.map((p) => formatProduct(p, lang)),
      bestsellers: bestsellers.map((p) => formatProduct(p, lang)),
    };
  },

  async search(query: string, lang = 'es') {
    if (!query || query.trim().length < 2) {
      throw appError(
        "La búsqueda debe tener al menos 2 caracteres",
        400,
        "QUERY_TOO_SHORT",
      );
    }

    const results = await productRepository.searchProducts(query.trim());
    return results.map((p) => formatProduct(p, lang));
  },

  async updateProduct(productId: string, input: UpdateProductInput, lang = 'es') {
    const existingProduct = await productRepository.findById(productId);
    if (!existingProduct) {
      throw appError("Producto no encontrado", 404, "PRODUCT_NOT_FOUND");
    }

    if (input.slug && input.slug !== existingProduct.slug) {
      const existingSlug = await productRepository.findBySlug(input.slug);
      if (existingSlug) {
        throw appError("El slug ya está en uso", 400, "SLUG_ALREADY_EXISTS");
      }
    }

    if (input.unit_type && input.unit_type !== existingProduct.unit_type) {
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

    if (input.price_per_kg && parseFloat(input.price_per_kg) <= 0) {
      throw appError("El precio debe ser mayor que 0", 400, "INVALID_PRICE");
    }

    const updatedProduct = await productRepository.updateProduct(
      productId,
      input,
    );

    if (!updatedProduct) {
      throw appError("Error al actualizar el producto", 500, "UPDATE_FAILED");
    }

    return formatProduct(updatedProduct, lang);
  },

  async getVariants(productId: string, lang = 'es') {
    const product = await productRepository.findById(productId);
    if (!product)
      throw appError("Producto no encontrado", 404, "PRODUCT_NOT_FOUND");

    return product.variants.map((v: any) => ({
      ...v,
      label: resolveI18n(v.label_i18n, v.label, lang),
      price: parseFloat(v.price),
    }));
  },
};
