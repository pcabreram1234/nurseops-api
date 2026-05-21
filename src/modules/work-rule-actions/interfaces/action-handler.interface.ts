export interface ActionHandlerInterface {
  execute(action: any, context: any): Promise<any>;
}
