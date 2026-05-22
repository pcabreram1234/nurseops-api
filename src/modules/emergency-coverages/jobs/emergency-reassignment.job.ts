import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";

interface EmergencyReassignmentPayload {
    emergencyCoverageId: string;
    reason?: string;
    metadata?: Record<string, any>;
}

@Processor("emergency-reassignment")
export class EmergencyReassignmentJob extends WorkerHost {
    // Process a reassignment job. Expects job.data to match EmergencyReassignmentPayload.
    async process(job: Job, token?: string): Promise<any> {
        const data = job.data as EmergencyReassignmentPayload | undefined;

        if (!data || !data.emergencyCoverageId) {
            // mark as failed by throwing
            throw new Error("Invalid job payload: missing emergencyCoverageId");
        }

        // Simple, self-contained implementation: log the operation and return a result.
        // In real usage this would call services/repositories to perform reassignment.
        const result = {
            emergencyCoverageId: data.emergencyCoverageId,
            reassignedAt: new Date().toISOString(),
            reason: data.reason || null,
            tokenUsed: !!token,
        };

        // minimal side-effect: print to stdout so job processors have trace
        // eslint-disable-next-line no-console
        console.info('[emergency-reassignment] processed', result);

        return result;
    }
}
