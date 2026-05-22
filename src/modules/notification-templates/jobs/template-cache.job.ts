import { Processor } from "@nestjs/bullmq";

@Processor(
    "template-cache",
)
export class TemplateCacheJob { }