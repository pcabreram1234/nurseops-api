import { Processor, WorkerHost } from "@nestjs/bullmq";

import { Job } from "bullmq";

import { PrismaService } from "@infra/database/prisma.service";

import { EmailNotificationsService } from "../services/email-notifications.service";
import { PushNotificationsService } from "../services/push-notifications.service";
import { SmsNotificationsService } from "../services/sms-notifications.service";
import { TemplateRendererService } from "@modules/notification-templates/services/template-renderer.service";

@Processor("notifications")
export class NotificationsProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailNotificationsService,
    private readonly pushService: PushNotificationsService,
    private readonly smsService: SmsNotificationsService,
    private readonly templateRenderer: TemplateRendererService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    switch (job.name) {
      case "schedule-published":
        return this.handleSchedulePublished(job.data);

      case "schedule-reminder":
        return this.handleScheduleReminder(job.data);

      default:
        console.log("Unknown notification job", job.name);
    }
  }

  async handleSchedulePublished(data: {
    scheduleId: string;
    nurseIds: string[];
    channels: {
      email: boolean;
      push: boolean;
      sms?: boolean;
      whatsapp?: boolean;
    };
    notes: string;
  }) {
    const { scheduleId, nurseIds, channels } = data;

    const users = await this.prisma.user.findMany({
      where: {
        nurses: {
          some: {
            id: { in: nurseIds },
          },
        },
      },
      select: {
        id: true,
        email: true,
        phone: true,
        pushTokens: true,
        firstName: true,
        lastName: true,
      },
    });

    if (users.length === 0) {
      return { sent: 0, message: "No users found for these nurses" };
    }

    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      select: {
        month: true,
        year: true,
        department: { select: { name: true } },
      },
    });

    const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    const periodLabel = schedule
      ? `${months[schedule.month - 1]} ${schedule.year}`
      : "";
    const departmentName = schedule?.department?.name || "";

    const title = "Nuevo horario publicado";
    const message = `El horario${departmentName ? ` de ${departmentName}` : ""} correspondiente a ${periodLabel} ha sido publicado.`;

    const subject = `NurseOps - Horario publicado ${periodLabel}`;
    const htmlBody = `
      <h2>Nuevo horario publicado</h2>
      <p>Estimado(a) colaborador(a),</p>
      <p>El horario${departmentName ? ` del departamento <strong>${departmentName}</strong>` : ""} correspondiente al período <strong>${periodLabel}</strong> ha sido publicado.</p>
      <p>Por favor, ingresa a la plataforma NurseOps para revisar tu asignación.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">Este es un mensaje automático de NurseOps.</p>
    `;

    const results: Record<string, boolean> = {};

    if (channels.email) {
      const emailRecipients = users
        .filter((u) => u.email)
        .map((u) => ({ email: u.email, name: `${u.firstName} ${u.lastName}` }));
      if (emailRecipients.length > 0) {
        results.email = await this.emailService.sendEmail(
          emailRecipients,
          subject,
          message,
          htmlBody,
        );
      }
    }

    if (channels.push) {
      const pushRecipients = users
        .filter((u) => u.pushTokens)
        .map((u) => ({ pushTokens: (u.pushTokens as string[]) || [] }));
      if (pushRecipients.length > 0) {
        results.push = await this.pushService.sendPushNotification(
          pushRecipients,
          title,
          message,
          { scheduleId },
        );
      }
    }

    if (channels.sms) {
      const smsRecipients = users
        .filter((u): u is typeof u & { phone: string } => !!u.phone)
        .map((u) => ({ phone: u.phone }));
      if (smsRecipients.length > 0) {
        results.sms = await this.smsService.sendSMS(smsRecipients, message);
      }
    }

    if (channels.whatsapp) {
      const waRecipients = users
        .filter((u): u is typeof u & { phone: string } => !!u.phone)
        .map((u) => ({ phone: u.phone }));
      if (waRecipients.length > 0) {
        results.whatsapp = await this.smsService.sendWhatsApp(waRecipients, message);
      }
    }

    return { sent: users.length, results };
  }

  async handleScheduleReminder(data: any) {
    console.log("Schedule reminder notification", data);
  }
}
