import { Processor, WorkerHost } from "@nestjs/bullmq";

import { PrismaService } from "@infra/database/prisma.service";

@Processor("audit")
export class AuditProcessor extends WorkerHost {
    constructor(
        private readonly prisma: PrismaService,
    ) {
        super();
    }

    async process(
        job: any,
    ) {
        const payload =
            job.data;

        await this.prisma.auditLog.create({
            data: {
                userId:
                    payload.context.userId,

                organizationId:
                    payload.context.organizationId,

                action:
                    payload.action,

                moduleId:
                    payload.response?.id ||
                    "unknown",

                old_value: {},

                new_value:
                    payload.response,

                ipAddress:
                    payload.context.ipAddress,

                userAgent:
                    payload.context.userAgent,

                requestId:
                    payload.context.requestId,
            },
        });
    }
}