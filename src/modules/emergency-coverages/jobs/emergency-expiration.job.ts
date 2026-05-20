import { Processor } from "@nestjs/bullmq";

@Processor("emergency-expiration")
export class EmergencyExpirationJob {}
