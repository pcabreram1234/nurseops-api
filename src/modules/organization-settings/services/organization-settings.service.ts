import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";
import { CreateOrganizationSettingDto } from "../dto/create-organization-setting.dto";
import { UpdateOrganizationSettingDto } from "../dto/update-organization-setting.dto";
import { PaginationDto } from "../dto/pagination.dto";

export interface UserOrgContext {
  organizationId?: string;
  role?: string;
}

@Injectable()
export class OrganizationSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(userOrg?: UserOrgContext) {
    const where: any = {};

    // Aislamiento: solo SUPER ve todas las organizaciones; el resto solo su propia org
    if (userOrg && userOrg.role !== 'SUPER') {
      if (userOrg.organizationId) {
        where.organizationId = userOrg.organizationId;
      }
    }

    return where;
  }

  async create(dto: CreateOrganizationSettingDto, userOrg: UserOrgContext) {
    // SUPER puede crear para cualquier organizationId del DTO; el resto usa su propia org
    const organizationId = userOrg.role === 'SUPER'
      ? dto.organizationId
      : userOrg.organizationId;

    if (!organizationId) {
      throw new NotFoundException("Usuario sin organización asociada");
    }

    const existing = await this.prisma.organizationSetting.findUnique({
      where: {
        organizationId,
      },
    });

    if (existing) {
      throw new ConflictException("Organization settings already exist");
    }

    return this.prisma.organizationSetting.create({
      data: {
        ...dto,
        organizationId,
      },
    });
  }

  async findAll(query: PaginationDto, userOrg?: UserOrgContext) {
    const where = this.buildWhere(userOrg);

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(500, Math.max(1, Number(query.limit) || 25));

    const [data, total] = await Promise.all([
      this.prisma.organizationSetting.findMany({
        where,
        include: {
          organization: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.organizationSetting.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(userOrg: UserOrgContext, organizationId?: string) {
    const where: any = {};

    if (userOrg.role === 'SUPER' && organizationId) {
      where.organizationId = organizationId;
    } else {
      where.organizationId = userOrg.organizationId;
    }

    const settings = await this.prisma.organizationSetting.findUnique({
      where,
    });

    if (!settings) {
      throw new NotFoundException("Organization settings not found");
    }

    return settings;
  }

  async update(dto: UpdateOrganizationSettingDto, userOrg?: UserOrgContext) {
    const settings = await this.findOne(userOrg ?? { organizationId: undefined, role: undefined });

    return this.prisma.organizationSetting.update({
      where: {
        organizationId: settings.organizationId,
      },
      data: dto,
    });
  }
}
