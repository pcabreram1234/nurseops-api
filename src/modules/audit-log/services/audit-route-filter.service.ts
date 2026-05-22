import { Injectable } from "@nestjs/common";

@Injectable()
export class AuditRouteFilterService {
    private readonly auditableMethods =
        [
            "POST",
            "PATCH",
            "PUT",
            "DELETE",
        ];

    private readonly ignoredRoutes =
        [
            "/health",
            "/docs",
            "/auth/login",
            "/auth/refresh",
        ];

    shouldAudit(
        method: string,
        path: string,
    ) {
        if (
            !this.auditableMethods.includes(
                method,
            )
        ) {
            return false;
        }

        return !this.ignoredRoutes.some(
            (
                route,
            ) =>
                path.includes(
                    route,
                ),
        );
    }
}