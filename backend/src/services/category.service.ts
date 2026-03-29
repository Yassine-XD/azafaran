import { categoryRepository } from "../repositories/category.repository";
import { productRepository } from "../repositories/product.repository";

function appError(message: string, statusCode: number, code: string) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

export const categoryService = {
  async getAll() {
    return categoryRepository.findAll();
  },

  async getProductsByCategory(slug: string, page: number, limit: number) {
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
      category,
      products: rows,
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  },
};
