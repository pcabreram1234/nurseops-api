export interface ModuleRegistryPayload {
    code: string;
    name: string;
    description: string;
    category?: string;
    version?: string;
    route?: string;
    isCore: boolean;
    isSystem: boolean;
}