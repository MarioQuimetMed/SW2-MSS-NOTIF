import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class NotificacionInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  mensaje: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  fmctoken: string; // Cambiar de tokens a fmctoken

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  imagen?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  datos?: Record<string, string>;
}

@InputType()
export class NotificacionTopicoInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  mensaje: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  topico: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  imagen?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  datos?: Record<string, string>;
}

@InputType()
export class SuscribirTopicoInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  fmctoken: string; // Cambiar de tokens a fmctoken

  @Field()
  @IsString()
  @IsNotEmpty()
  topico: string;
}
