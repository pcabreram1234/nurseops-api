import { Processor } from "@nestjs/bullmq";

@Processor("shift-change-expiration")
export class AutoExpireShiftChangeJob {}
