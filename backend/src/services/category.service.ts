import { categoryRepository } from "../repositories/category.repository";
import { productRepository } from "../repositories/product.repository";
import { resolveI18n } from "../utils/i18n";

function appError(message: string, statusCode: number, code: string) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

function formatCategory(cat: any, lang = 'es') {
  return {
    ...cat,
    name: resolveI18n(cat.name_i18n, cat.name, lang),
    description: resolveI18n(cat.description_i18n, cat.description, lang),
  };
}

export const categoryService = {
  async getAll(lang = 'es') {
    const categories = await categoryRepository.findAll();
    return categories.map((c) => formatCategory(c, lang));
  },

  async getProductsByCategory(slug: string, page: number, limit: number, lang = 'es') {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) {
      throw appError("Categoría no encontrada", 404, "CATEGORY_NOT_FOUND");
    }

    const { rows, total } = await productRepository.findByCategory(
      slug,
      page,
      limit,
    );

    return {
      category: formatCategory(category, lang),
      products: rows.map((p: any) => ({
        ...p,
        name: resolveI18n(p.name_i18n, p.name, lang),
        description: resolveI18n(p.description_i18n, p.description, lang),
        short_desc: resolveI18n(p.short_desc_i18n, p.short_desc, lang),
        price_per_kg: parseFloat(p.price_per_kg),
      })),
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  },
};
