import { Injectable } from '@nestjs/common';

@Injectable()
export class ApprovalAiService {
  async evaluateImpact(requestingNurseId: string, targetNurseId: string, shiftEntryId: string): Promise<{ score: number; risk: string; recommendation: string }> {
    // Simulación de análisis heurístico/clínico (Carga laboral, fatiga o métricas históricas)
    return {
      score: 0.92,
      risk: 'LOW',
      recommendation: 'Recommended. It does not alter mandatory breaks or generate time overload.',
    };
  }
}