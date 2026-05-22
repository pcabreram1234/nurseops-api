import { Injectable } from '@nestjs/common';

@Injectable()
export class WorkloadBalanceValidator {
    calculateImbalance(scores: number[]): boolean {
        if (scores.length < 2) return false;
        const max = Math.max(...scores);
        const min = Math.min(...scores);
        // Si la brecha de carga entre el enfermero más explotado y el menos cargado supera los 45 puntos, hay desbalance
        return max - min > 45;
    }
}