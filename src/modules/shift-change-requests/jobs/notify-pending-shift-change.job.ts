import { Processor } from "@nestjs/bullmq";

@Processor("pending-shift-change")
export class NotifyPendingShiftChangeJob {}
