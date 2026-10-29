import { BadRequestException, ForbiddenException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

/**
 * Returns the organization scope for a request.
 * SUPER users can operate across organizations, so their scope is undefined.
 */
export function organizationScope(user: any): string | undefined {
  if (!user) return undefined;
  if (user.role === "SUPER") return undefined;
  return user.organizationId ?? undefined;
}

/**
 * Validates that a branch exists and, when an organization scope is provided,
 * that it belongs to that organization.
 *
 * This is the service-layer companion of the `trg_*_branch_org` database
 * triggers. It exists to return a clear 400/403 instead of a raw SQL error.
 */
export async function assertBranchInOrganization(
  prisma: PrismaService,
  branchId: string,
  organizationId?: string | null,
): Promise<void> {
  if (!branchId) {
    throw new BadRequestException("A branch (sede) is required.");
  }

  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { id: true, organizationId: true, isActive: true },
  });

  if (!branch) {
    throw new BadRequestException("The selected branch does not exist.");
  }

  if (organizationId && branch.organizationId !== organizationId) {
    throw new ForbiddenException(
      "The selected branch does not belong to your organization.",
    );
  }
}

/**
 * Asserts that a department actually operates in a given branch.
 */
export async function assertDepartmentServesBranch(
  prisma: PrismaService,
  departmentId: string,
  branchId: string,
): Promise<void> {
  const link = await prisma.departmentBranch.findUnique({
    where: { departmentId_branchId: { departmentId, branchId } },
    select: { departmentId: true },
  });

  if (!link) {
    throw new BadRequestException(
      "The selected department does not operate in the selected branch.",
    );
  }
}

/**
 * Resolves the branch to use for a department-scoped resource.
 * - If `branchId` is provided, it is validated against the organization and the
 *   department/branch link.
 * - Otherwise the primary branch of the department is used.
 */
export async function resolveDepartmentBranch(
  prisma: PrismaService,
  departmentId: string,
  organizationId?: string | null,
  branchId?: string | null,
): Promise<string> {
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    select: { id: true, organizationId: true },
  });

  if (!department) {
    throw new BadRequestException("The selected department does not exist.");
  }

  if (organizationId && department.organizationId !== organizationId) {
    throw new ForbiddenException(
      "The selected department does not belong to your organization.",
    );
  }

  if (branchId) {
    await assertBranchInOrganization(prisma, branchId, department.organizationId);
    await assertDepartmentServesBranch(prisma, departmentId, branchId);
    return branchId;
  }

  const primary = await prisma.departmentBranch.findFirst({
    where: { departmentId },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    select: { branchId: true },
  });

  if (!primary) {
    throw new BadRequestException(
      "The selected department is not linked to any branch (sede).",
    );
  }

  return primary.branchId;
}

/**
 * Resolves the usual branch of a nurse: their explicit branch assignment or,
 * failing that, the primary branch of their department.
 */
export async function resolveNurseBranch(
  prisma: PrismaService,
  nurseId: string,
  organizationId?: string | null,
): Promise<string | null> {
  const nurse = await prisma.nurse.findUnique({
    where: { id: nurseId },
    select: {
      id: true,
      organizationId: true,
      branchId: true,
      departmentId: true,
      department: {
        select: {
          branches: {
            where: { isPrimary: true },
            select: { branchId: true },
            take: 1,
          },
        },
      },
    },
  });

  if (!nurse) {
    throw new BadRequestException("The selected nurse does not exist.");
  }

  if (organizationId && nurse.organizationId !== organizationId) {
    throw new ForbiddenException(
      "The selected nurse does not belong to your organization.",
    );
  }

  return nurse.branchId ?? nurse.department?.branches?.[0]?.branchId ?? null;
}
