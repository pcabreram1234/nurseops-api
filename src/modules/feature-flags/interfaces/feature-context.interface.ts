import { FeatureEnvironment } from '../enums/feature-environment.enum';
export interface FeatureContext {
    userId?: string;
    departmentId?: string;
    environment: FeatureEnvironment;
}