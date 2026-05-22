import { Processor, WorkerHost } from '@nestjs/bullmq'; // 🌟 Asegúrate de usar @nestjs/bullmq
import { Job } from 'bullmq';

@Processor('emergency-matching') // Reemplaza por el nombre exacto de tu cola
export class EmergencyMatchingJob extends WorkerHost { // 🛠️ 1. Agrega el 'extends WorkerHost'

    // 🛠️ 2. Debes implementar obligatoriamente el método 'process'
    async process(job: Job<any, any, string>): Promise<any> {

        // 🛠️ 3. Si manejas diferentes tipos de tareas dentro de la misma cola, 
        // puedes usar el 'job.name' mediante un switch:
        switch (job.name) {
            case 'match-action': // El nombre de la tarea que antes ponías en @Process()
                return await this.handleEmergencyMatching(job.data);

            default:
                throw new Error(`Acción de job desconocida: ${job.name}`);
        }
    }

    // Tu lógica de negocio real se mueve aquí abajo:
    private async handleEmergencyMatching(data: any) {
        console.log('Procesando emparejamiento de enfermeros de emergencia...', data);
        // Tu lógica con Prisma para buscar candidatos de reemplazo...
        return { success: true };
    }
}