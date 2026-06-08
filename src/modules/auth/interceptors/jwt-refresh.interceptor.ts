// 📄 @modules/auth/interceptors/jwt-refresh.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtRefreshInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        // 1. Si el JwtAuthGuard validó al usuario, estará en request.user
        const user = request.user;

        // 2. Si no hay usuario (ej: ruta pública como Login), no hacemos nada
        if (!user) return data;

        // 3. Re-creamos el payload limpio basado en los datos actuales
        const payload = {
          id: user.id,
          sub: user.sub,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          permissions: user.permissions, // Mantiene sus permisos actualizados
        };

        // 4. Firmamos un nuevo Access Token fresco
        // Nota: Asegúrate de configurar la expiración corta aquí (ej: '15m') o en tu config
        const nuevoToken = this.jwtService.sign(payload, { expiresIn: '1d' });

        // 5. Lo inyectamos en los Headers de la respuesta HTTP saliente
        response.setHeader('x-new-access-token', nuevoToken);
        // Habilitamos que Axios pueda leer esta cabecera personalizada (crucial para CORS)
        response.setHeader('Access-Control-Expose-Headers', 'x-new-access-token');

        return data; // Devolvemos los datos de la petición original sin alterarlos
      }),
    );
  }
}