import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import {
  NotificacionInput,
  NotificacionTopicoInput,
  SuscribirTopicoInput,
} from './dto/notificacion.input';
import {
  EstadoNotificacion,
  Notificacion,
  NotificacionResult,
  NotificacionTopicoResult,
} from './entities/notificacion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NotificacionService {
  private readonly logger = new Logger(NotificacionService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    @InjectRepository(Notificacion)
    private notificacionRepository: Repository<Notificacion>,
  ) {}

  private manejarError(error: unknown, mensaje: string): never {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    this.logger.error(`${mensaje}: ${errorMessage}`);
    throw error;
  }
  async enviarNotificacion(
    notificacionInput: NotificacionInput,
  ): Promise<NotificacionResult> {
    try {
      const { titulo, mensaje, fmctoken, datos, imagen } = notificacionInput;

      // Crear registro simplificado en la BD
      const nuevaNotificacion = this.notificacionRepository.create({
        titulo,
        mensaje,
        fcmToken: fmctoken, // Ahora es un solo string
        estado: EstadoNotificacion.PENDIENTE,
      });

      await this.notificacionRepository.save(nuevaNotificacion);

      // Preparar el mensaje para Firebase
      const mensaje_notificacion = {
        notification: {
          title: titulo,
          body: mensaje,
          ...(imagen && { imageUrl: imagen }),
        },
        ...(datos && { data: datos }),
        token: fmctoken, // Firebase usa "token" singular para un solo token
      };

      // Enviar la notificación a un solo dispositivo
      const resultado = await this.firebaseService
        .getFirebaseAdmin()
        .messaging()
        .send(mensaje_notificacion); // send en lugar de sendEachForMulticast

      // Actualizar el estado - la respuesta de send es diferente
      nuevaNotificacion.estado = EstadoNotificacion.ENVIADA;
      await this.notificacionRepository.save(nuevaNotificacion);

      return {
        exitosas: 1, // Exitoso si llega aquí sin excepciones
        fallidas: 0,
        resultados: [`Mensaje enviado con ID: ${resultado}`],
      };
    } catch (error) {
      // Verificar el tipo de error antes de acceder a message
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      // Si hay un error, se considera fallida
      return {
        exitosas: 0,
        fallidas: 1,
        resultados: [`Error: ${errorMessage || 'Error desconocido'}`],
      };
    }
  }

  async enviarNotificacionPorTopico(
    notificacionInput: NotificacionTopicoInput,
  ): Promise<NotificacionTopicoResult> {
    try {
      const { titulo, mensaje, topico, datos, imagen } = notificacionInput;

      // Crear registro simplificado en BD
      const nuevaNotificacion = this.notificacionRepository.create({
        titulo,
        mensaje,
        topico,
        estado: EstadoNotificacion.PENDIENTE,
      });

      await this.notificacionRepository.save(nuevaNotificacion);

      const mensaje_notificacion = {
        notification: {
          title: titulo,
          body: mensaje,
          ...(imagen && { imageUrl: imagen }),
        },
        ...(datos && { data: datos }),
        topic: topico,
      };

      const resultado = await this.firebaseService
        .getFirebaseAdmin()
        .messaging()
        .send(mensaje_notificacion);

      // Actualizar estado
      nuevaNotificacion.estado = EstadoNotificacion.ENVIADA;
      await this.notificacionRepository.save(nuevaNotificacion);

      return {
        messageId: resultado,
        topico,
      };
    } catch (error) {
      return this.manejarError(
        error,
        'Error al enviar notificación por tópico',
      );
    }
  }

  async suscribirATopico(
    suscripcionInput: SuscribirTopicoInput,
  ): Promise<NotificacionResult> {
    try {
      const { fmctoken, topico } = suscripcionInput;

      const resultado = await this.firebaseService
        .getFirebaseAdmin()
        .messaging()
        .subscribeToTopic([fmctoken], topico); // Envolver en array para la API de Firebase

      // Registrar la operación
      await this.notificacionRepository.save({
        titulo: 'Suscripción a tópico',
        mensaje: `Token suscrito al tópico ${topico}`,
        topico,
        fcmToken: fmctoken,
        estado: EstadoNotificacion.ENVIADA,
      });

      return {
        exitosas: resultado.successCount,
        fallidas: resultado.failureCount,
        resultados: resultado.errors.map((e) => e.error.message),
      };
    } catch (error) {
      return this.manejarError(error, 'Error al suscribir al tópico');
    }
  }

  async desuscribirDeTopico(
    suscripcionInput: SuscribirTopicoInput,
  ): Promise<NotificacionResult> {
    try {
      const { fmctoken, topico } = suscripcionInput;

      const resultado = await this.firebaseService
        .getFirebaseAdmin()
        .messaging()
        .unsubscribeFromTopic([fmctoken], topico); // Envolver en array para la API de Firebase

      // Registrar la operación
      await this.notificacionRepository.save({
        titulo: 'Desuscripción de tópico',
        mensaje: `Token desuscrito del tópico ${topico}`,
        topico,
        fcmToken: fmctoken,
        estado: EstadoNotificacion.ENVIADA,
      });

      return {
        exitosas: resultado.successCount,
        fallidas: resultado.failureCount,
        resultados: resultado.errors.map((e) => e.error.message),
      };
    } catch (error) {
      return this.manejarError(error, 'Error al desuscribir del tópico');
    }
  }

  // Métodos para consultar notificaciones
  async obtenerNotificaciones(
    skip = 0,
    take = 10,
    filtros?: Partial<Notificacion>,
  ): Promise<Notificacion[]> {
    try {
      const queryBuilder = this.notificacionRepository
        .createQueryBuilder('notificacion')
        .orderBy('notificacion.createdAt', 'DESC')
        .skip(skip)
        .take(take);

      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryBuilder.andWhere(`notificacion.${key} = :${key}`, {
              [key]: value,
            });
          }
        });
      }

      return queryBuilder.getMany();
    } catch (error) {
      return this.manejarError(error, 'Error al obtener notificaciones');
    }
  }

  async contarNotificaciones(filtros?: Partial<Notificacion>): Promise<number> {
    try {
      const queryBuilder =
        this.notificacionRepository.createQueryBuilder('notificacion');

      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryBuilder.andWhere(`notificacion.${key} = :${key}`, {
              [key]: value,
            });
          }
        });
      }

      return queryBuilder.getCount();
    } catch (error) {
      return this.manejarError(error, 'Error al contar notificaciones');
    }
  }

  async obtenerNotificacionPorId(id: string): Promise<Notificacion> {
    try {
      const notificacion = await this.notificacionRepository.findOne({
        where: { id },
      });

      if (!notificacion) {
        throw new Error(`Notificación con ID ${id} no encontrada`);
      }

      return notificacion;
    } catch (error) {
      return this.manejarError(error, 'Error al obtener notificación por ID');
    }
  }
}
