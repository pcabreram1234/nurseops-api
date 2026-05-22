import { PartialType } from '@nestjs/mapped-types';
import { CreateOptimizationRunDto } from './create-optimization-run.dto';

export class UpdateOptimizationRunDto extends PartialType(CreateOptimizationRunDto) { }