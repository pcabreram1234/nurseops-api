import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";

@Processor("emergency-expiration")
export class EmergencyExpirationJob extends WorkerHost {
    private readonly logger = new Logger(EmergencyExpirationJob.name);

    /**
     * Process an emergency expiration job.
     * Expects job.data to contain at least { emergencyId: string, expiredAt?: string }
     */
    async process(job: Job): Promise<void> {
        const { id, data } = job;
        try {
            this.logger.log(`Processing emergency-expiration job id=${id}`);

            if (!data || !data.emergencyId) {
                this.logger.warn(`Job id=${id} missing emergencyId, skipping.`);
                return;
            }

            const emergencyId = String(data.emergencyId);
            const expiredAt = data.expiredAt ? new Date(data.expiredAt) : new Date();

            // Placeholder for real expiration handling logic.
            // Replace with service calls to update DB, notify users, etc.
            this.logger.log(
                `Marking emergency coverage ${emergencyId} as expired at ${expiredAt.toISOString()}`
            );

            // Simulate async work (e.g., DB update, notifications)
            await Promise.resolve();

            this.logger.log(`Completed emergency-expiration job id=${id} for emergencyId=${emergencyId}`);
        } catch (error) {
            this.logger.error(`Error processing job id=${id}: ${(error as Error).message}`, (error as Error).stack);
            throw error;
        }
    }
}
