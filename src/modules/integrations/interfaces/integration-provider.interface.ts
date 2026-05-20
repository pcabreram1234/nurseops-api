export interface IntegrationProvider {
  provider: string;

  send(payload: any): Promise<any>;
}
