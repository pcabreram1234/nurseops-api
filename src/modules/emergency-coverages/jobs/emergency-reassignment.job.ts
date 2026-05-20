import { Processor } from "@nestjs/bullmq";

@Processor("emergency-reassignment")
export class EmergencyReassignmentJob {}
