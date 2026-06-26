import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      where: {
        vendorId: null,
      },
      orderBy: {
        name: "asc",
      },
      include: this.categoryIncludes(),
    });
  }

  findVisibleForUser(user: AuthenticatedUser) {
    return this.prisma.category.findMany({
      where:
        user.role === UserRole.ADMIN
          ? {}
          : {
              OR: [{ vendorId: null }, { vendorId: user.id }],
            },
      orderBy: [{ vendorId: "asc" }, { name: "asc" }],
      include: this.categoryIncludes(),
    });
  }

  async create(createCategoryDto: CreateCategoryDto, user?: AuthenticatedUser) {
    const slug = this.slugify(createCategoryDto.slug ?? createCategoryDto.name);
    const vendorId = user && user.role !== UserRole.ADMIN ? user.id : null;
    await this.ensureSlugIsAvailable(slug, vendorId);

    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        nameAr: createCategoryDto.nameAr || null,
        nameEn: createCategoryDto.nameEn || null,
        slug,
        vendorId,
      },
      include: this.categoryIncludes(),
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, user?: AuthenticatedUser) {
    const category = await this.ensureCategoryExists(id);

    if (user && user.role !== UserRole.ADMIN && category.vendorId !== user.id) {
      throw new ForbiddenException("You cannot edit this category");
    }

    const data: {
      name?: string;
      nameAr?: string | null;
      nameEn?: string | null;
      slug?: string;
    } = {};

    if (updateCategoryDto.name) {
      data.name = updateCategoryDto.name;
    }

    if (updateCategoryDto.nameAr !== undefined) {
      data.nameAr = updateCategoryDto.nameAr || null;
    }

    if (updateCategoryDto.nameEn !== undefined) {
      data.nameEn = updateCategoryDto.nameEn || null;
    }

    if (updateCategoryDto.slug) {
      const slug = this.slugify(updateCategoryDto.slug);
      await this.ensureSlugIsAvailable(slug, category.vendorId, id);
      data.slug = slug;
    }

    return this.prisma.category.update({
      where: { id },
      data,
      include: this.categoryIncludes(),
    });
  }

  async remove(id: string, user?: AuthenticatedUser) {
    const category = await this.ensureCategoryExists(id);

    if (user && user.role !== UserRole.ADMIN && category.vendorId !== user.id) {
      throw new ForbiddenException("You cannot delete this category");
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }

  private async ensureCategoryExists(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return category;
  }

  private async ensureSlugIsAvailable(slug: string, vendorId: string | null, excludeCategoryId?: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        slug,
        vendorId,
      },
    });

    if (category && category.id !== excludeCategoryId) {
      throw new ConflictException("Category slug is already used");
    }
  }

  private categoryIncludes() {
    return {
      _count: {
        select: {
          products: true,
        },
      },
    };
  }

  private slugify(value: string) {
    const slug = value
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "");

    return slug || "category";
  }
}
