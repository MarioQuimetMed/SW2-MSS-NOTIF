import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NotificacionService } from './notificacion.service';
import {
  NotificacionInput,
  NotificacionTopicoInput,
  SuscribirTopicoInput,
} from './dto/notificacion.input';
import {
  NotificacionResult,
  NotificacionTopicoResult,
} from './entities/notificacion.entity';

@Resolver()
export class NotificacionResolver {
  constructor(private readonly notificacionService: NotificacionService) {}

  // Agregar al menos una consulta básica
  @Query(() => String)
  estadoServicio(): string {
    return 'Servicio de notificaciones activo';
  }

  @Mutation(() => NotificacionResult)
  async enviarNotificacion(
    @Args('notificacionInput') notificacionInput: NotificacionInput,
  ): Promise<NotificacionResult> {
    return this.notificacionService.enviarNotificacion(notificacionInput);
  }

  @Mutation(() => NotificacionTopicoResult)
  async enviarNotificacionPorTopico(
    @Args('notificacionInput') notificacionInput: NotificacionTopicoInput,
  ): Promise<NotificacionTopicoResult> {
    return this.notificacionService.enviarNotificacionPorTopico(
      notificacionInput,
    );
  }

  @Mutation(() => NotificacionResult)
  async suscribirATopico(
    @Args('suscripcionInput') suscripcionInput: SuscribirTopicoInput,
  ): Promise<NotificacionResult> {
    return this.notificacionService.suscribirATopico(suscripcionInput);
  }

  @Mutation(() => NotificacionResult)
  async desuscribirDeTopico(
    @Args('suscripcionInput') suscripcionInput: SuscribirTopicoInput,
  ): Promise<NotificacionResult> {
    return this.notificacionService.desuscribirDeTopico(suscripcionInput);
  }
}
