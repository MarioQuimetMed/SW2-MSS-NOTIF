import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacionService } from './notificacion.service';
import { NotificacionController } from './notificacion.controller';
import { NotificacionResolver } from './notificacion.resolver';
import { Notificacion } from './entities/notificacion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notificacion]), // Registrar el repositorio
  ],
  providers: [NotificacionService, NotificacionResolver],
  controllers: [NotificacionController],
})
export class NotificacionModule {}
