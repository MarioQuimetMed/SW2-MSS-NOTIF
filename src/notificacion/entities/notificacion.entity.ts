import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import GraphQLJSON from 'graphql-type-json';

// Define el enum para el estado de notificaciones
export enum EstadoNotificacion {
  PENDIENTE = 'pendiente',
  ENVIADA = 'enviada',
  FALLIDA = 'fallida',
}

// Registra el enum para GraphQL
registerEnumType(EstadoNotificacion, {
  name: 'EstadoNotificacion',
});

// Entidad principal para la tabla de notificaciones
@Entity('notificaciones')
@ObjectType()
export class Notificacion {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  titulo: string;

  @Column()
  @Field()
  mensaje: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  topico?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  fcmToken?: string;

  @Column({
    type: 'enum',
    enum: EstadoNotificacion,
    default: EstadoNotificacion.PENDIENTE,
  })
  @Field(() => EstadoNotificacion)
  estado: EstadoNotificacion;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}

// Mantener las clases existentes para compatibilidad
@ObjectType()
export class NotificacionResult {
  @Field(() => Number)
  exitosas: number;

  @Field(() => Number)
  fallidas: number;

  @Field(() => [String], { nullable: true })
  resultados?: string[];
}

@ObjectType()
export class NotificacionTopicoResult {
  @Field(() => String)
  messageId: string;

  @Field(() => String)
  topico: string;
}

// Usamos un escalar JSON en lugar de un objeto con índices
@ObjectType()
export class DatosNotificacion {
  @Field(() => GraphQLJSON, { nullable: true })
  datos?: Record<string, string>;
}
