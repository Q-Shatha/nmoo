import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, UserRole } from "@prisma/client";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { PrismaService } from "../prisma/prisma.service";
import { CreateStorePageDto } from "./dto/create-store-page.dto";
import { UpdateStorePageDto } from "./dto/update-store-page.dto";

@Injectable()
export class StorePagesService {
  constructor(private readonly prisma: PrismaService) {}

  findPublished() {
    return this.prisma.storePage.findMany({
      where: { published: true },
      orderBy: { updatedAt: "desc" },
      include: this.includes(),
    });
  }

  findMine(user: AuthenticatedUser) {
    return this.prisma.storePage.findMany({
      where: { vendorId: user.id },
      orderBy: { updatedAt: "desc" },
      include: this.includes(),
    });
  }

  findPublishedByVendor(vendorId: string) {
    return this.prisma.storePage.findMany({
      where: { vendorId, published: true },
      orderBy: { updatedAt: "desc" },
      include: this.includes(),
    });
  }

  async findOnePublished(id: string) {
    const page = await this.prisma.storePage.findFirst({
      where: { id, published: true },
      include: this.includes(),
    });

    if (!page) {
      throw new NotFoundException("Store page not found");
    }

    return page;
  }

  async create(dto: CreateStorePageDto, user: AuthenticatedUser) {
    const slug = this.slugify(dto.slug ?? dto.title);

    try {
      return await this.prisma.storePage.create({
        data: {
          vendorId: user.id,
          title: dto.title.trim(),
          slug,
          content: dto.content.trim(),
          published: dto.published ?? true,
        },
        include: this.includes(),
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Store page slug is already used by this vendor");
      }

      throw error;
    }
  }

  async update(id: string, dto: UpdateStorePageDto, user: AuthenticatedUser) {
    const page = await this.ensurePageExists(id);
    this.ensureCanManage(page.vendorId, user);

    const data: Prisma.StorePageUpdateInput = {};

    if (dto.title !== undefined) {
      data.title = dto.title.trim();
    }

    if (dto.slug !== undefined) {
      data.slug = this.slugify(dto.slug);
    }

    if (dto.content !== undefined) {
      data.content = dto.content.trim();
    }

    if (dto.published !== undefined) {
      data.published = dto.published;
    }

    try {
      return await this.prisma.storePage.update({
        where: { id },
        data,
        include: this.includes(),
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Store page slug is already used by this vendor");
      }

      throw error;
    }
  }

  async remove(id: string, user: AuthenticatedUser) {
    const page = await this.ensurePageExists(id);
    this.ensureCanManage(page.vendorId, user);

    return this.prisma.storePage.delete({
      where: { id },
    });
  }

  private async ensurePageExists(id: string) {
    const page = await this.prisma.storePage.findUnique({ where: { id } });

    if (!page) {
      throw new NotFoundException("Store page not found");
    }

    return page;
  }

  private ensureCanManage(vendorId: string, user: AuthenticatedUser) {
    if (user.role !== UserRole.ADMIN && vendorId !== user.id) {
      throw new ForbiddenException("You cannot manage this store page");
    }
  }

  private includes() {
    return {
      vendor: {
        select: {
          id: true,
          name: true,
          email: true,
          storeUsername: true,
          role: true,
          theme: true,
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

    return slug || "store-page";
  }

  private isUniqueConstraintError(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
  }
}
