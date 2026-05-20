import { Processor } from "@nestjs/bullmq";

@Processor("emergency-matching")
export class EmergencyMatchingJob {}
