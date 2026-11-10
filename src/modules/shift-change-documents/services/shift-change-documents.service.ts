import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@infra/database/prisma.service";

export interface UserOrgContext {
    organizationId?: string;
    departmentId?: string;
    role?: string;
    id?: string;
    sub?: string;
}

/**
 * Resuelve el departmentId del usuario a partir del JWT.
 */
async function resolveUserDepartmentId(prisma: PrismaService, userOrg: UserOrgContext): Promise<string | undefined> {
    if (userOrg.departmentId) {
        return userOrg.departmentId;
    }
    const userId = userOrg.id || userOrg.sub;
    if (!userId) return undefined;

    const nurse = await prisma.nurse.findFirst({
        where: { userId },
        select: { departmentId: true },
    });
    return nurse?.departmentId;
}

@Injectable()
export class ShiftChangeDocumentsService {
    constructor(private readonly prisma: PrismaService) { }

    private buildWhere(filters: any, userOrg?: UserOrgContext) {
        const where: any = {
            deletedAt: null,
            ...(filters.requesterId && { requesterId: filters.requesterId }),
            ...(filters.shiftChangeRequestId && { shiftChangeRequestId: filters.shiftChangeRequestId }),
            ...(filters.documentType && { documentType: filters.documentType }),
        };

        // Aislamiento organizacional
        if (userOrg && userOrg.role !== 'SUPER') {
            if (userOrg.organizationId) {
                where.organizationId = userOrg.organizationId;
            }

            // JUNIOR_NURSE / SENIOR_NURSE: solo sus propios documentos (donde son el requester)
            if (['JUNIOR_NURSE', 'SENIOR_NURSE'].includes(userOrg.role!)) {
                const userId = userOrg.id || userOrg.sub;
                if (userId) {
                    where.requesterId = userId;
                }
            }
        }

        return where;
    }

    async create(dto: any, userOrg?: UserOrgContext) {
        // Solo SUPER, SYSTEM_ADMIN, HR_MANAGER, SUPERVISOR, NIGHT_SUPERVISOR pueden crear
        const allowedCreateRoles = ['SUPER', 'SYSTEM_ADMIN', 'HR_MANAGER', 'SUPERVISOR', 'NIGHT_SUPERVISOR'];
        if (!userOrg || !allowedCreateRoles.includes(userOrg.role!)) {
            throw new ForbiddenException('Su rol no tiene permiso para crear documentos de cambio de turno');
        }

        // Verificar que el shiftChangeRequest existe y pertenece a la organización
        const shiftChangeRequest = await this.prisma.shiftChangeRequest.findUnique({
            where: { id: dto.shiftChangeRequestId },
            select: { organizationId: true },
        });

        if (!shiftChangeRequest) {
            throw new NotFoundException('La solicitud de cambio de turno no existe');
        }

        if (shiftChangeRequest.organizationId !== userOrg.organizationId && userOrg.role !== 'SUPER') {
            throw new ForbiddenException('La solicitud no pertenece a su organización');
        }

        // Asegurar que requesterId sea el usuario actual si es NURSE
        if (['JUNIOR_NURSE', 'SENIOR_NURSE'].includes(userOrg.role!)) {
            dto.requesterId = userOrg.id || userOrg.sub;
        }

        return this.prisma.shiftChangeDocument.create({
            data: {
                ...dto,
                organizationId: userOrg.organizationId,
            },
        });
    }

    async findAll(filters: any, userOrg?: UserOrgContext) {
        const where = this.buildWhere(filters, userOrg);

        return this.prisma.shiftChangeDocument.findMany({
            where,
            include: {
                shiftChangeRequest: true,
                requester: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                uploadedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, userOrg?: UserOrgContext) {
        const where: any = { id, deletedAt: null };

        if (userOrg && userOrg.role !== 'SUPER') {
            if (userOrg.organizationId) {
                where.organizationId = userOrg.organizationId;
            }

            // JUNIOR_NURSE / SENIOR_NURSE: solo sus propios documentos
            if (['JUNIOR_NURSE', 'SENIOR_NURSE'].includes(userOrg.role!)) {
                const userId = userOrg.id || userOrg.sub;
                if (userId) {
                    where.requesterId = userId;
                }
            }
        }

        const document = await this.prisma.shiftChangeDocument.findFirst({
            where,
            include: {
                shiftChangeRequest: true,
                requester: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                uploadedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        if (!document) {
            throw new NotFoundException("Document not found");
        }

        return document;
    }

    async update(id: string, dto: any, userOrg?: UserOrgContext) {
        // Verificar acceso al documento
        const document = await this.findOne(id, userOrg);

        // Solo SUPER, SYSTEM_ADMIN, SUPERVISOR, NIGHT_SUPERVISOR pueden actualizar
        const allowedUpdateRoles = ['SUPER', 'SYSTEM_ADMIN', 'HR_MANAGER', 'SUPERVISOR', 'NIGHT_SUPERVISOR'];
        if (userOrg && !allowedUpdateRoles.includes(userOrg.role!)) {
            throw new ForbiddenException('Su rol no tiene permiso para actualizar documentos');
        }

        return this.prisma.shiftChangeDocument.update({
            where: { id },
            data: dto,
        });
    }

    async softDelete(id: string, userOrg?: UserOrgContext) {
        // Verificar acceso al documento
        const document = await this.findOne(id, userOrg);

        // Solo SUPER, SYSTEM_ADMIN pueden eliminar
        if (userOrg && !['SUPER', 'SYSTEM_ADMIN'].includes(userOrg.role!)) {
            throw new ForbiddenException('Su rol no tiene permiso para eliminar documentos');
        }

        return this.prisma.shiftChangeDocument.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    async upload(file: any, dto: any, userOrg?: UserOrgContext) {
        // Validar permisos de carga
        const allowedUploadRoles = ['SUPER', 'SYSTEM_ADMIN', 'HR_MANAGER', 'SUPERVISOR', 'NIGHT_SUPERVISOR', 'JUNIOR_NURSE', 'SENIOR_NURSE'];
        if (!userOrg || !allowedUploadRoles.includes(userOrg.role!)) {
            throw new ForbiddenException('Su rol no tiene permiso para subir documentos');
        }

        // TODO: Implementar lógica real de upload a S3/MinIO
        // Por ahora retorna el DTO para crear el registro
        return this.create({
            ...dto,
            shiftChangeRequestId: dto.shiftChangeRequestId,
            documentType: dto.documentType,
            fileName: file.originalname,
            documentUrl: `uploads/${file.filename}`,
            mimeType: file.mimetype,
            size: file.size,
            uploadedById: userOrg.id || userOrg.sub,
        }, userOrg);
    }

    async verify(id: string, dto: any, userOrg?: UserOrgContext) {
        // Verificar acceso al documento
        const document = await this.findOne(id, userOrg);

        // Solo SUPER, SYSTEM_ADMIN, SUPERVISOR, NIGHT_SUPERVISOR pueden verificar
        const allowedVerifyRoles = ['SUPER', 'SYSTEM_ADMIN', 'HR_MANAGER', 'SUPERVISOR', 'NIGHT_SUPERVISOR'];
        if (!userOrg || !allowedVerifyRoles.includes(userOrg.role!)) {
            throw new ForbiddenException('Su rol no tiene permiso para verificar documentos');
        }

        // El usuario que subió el documento no puede verificarlo a sí mismo
        if (document.uploadedById === (userOrg.id || userOrg.sub)) {
            throw new ForbiddenException('No puede verificar un documento que usted mismo subió');
        }

        return this.prisma.shiftChangeDocument.update({
            where: { id },
            data: {
                verified: true,
                verifiedById: userOrg.id || userOrg.sub,
                verifiedAt: new Date(),
            },
        });
    }
}
