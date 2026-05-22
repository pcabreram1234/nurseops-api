import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkloadMetricDto } from './create-workload-metric.dto';

export class UpdateWorkloadMetricDto extends PartialType(CreateWorkloadMetricDto) { }