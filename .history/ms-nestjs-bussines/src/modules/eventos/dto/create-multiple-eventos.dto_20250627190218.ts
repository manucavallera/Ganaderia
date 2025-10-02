import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO para un evento individual (sin IDs de terneros/madres)
export class EventoDataDto {
  @ApiProperty({ description: 'Fecha del evento', example: '2024-02-27' })
  @IsNotEmpty()
  @IsDateString()
  fecha_evento: string;

  @ApiProperty({
    description: 'Observación sobre el evento',
    example: 'Vacunación contra fiebre aftosa',
  })
  @IsNotEmpty()
  @IsString()
  observacion: string;
}

// DTO para crear múltiples eventos
export class CreateMultipleEventosDto {
  @ApiProperty({
    description: 'Array de eventos a crear',
    example: [
      {
        fecha_evento: '2024-06-01',
        observacion: 'Vacunación',
      },
      {
        fecha_evento: '2024-06-05',
        observacion: 'Control veterinario',
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos un evento' })
  @ValidateNested({ each: true })
  @Type(() => EventoDataDto)
  eventos: EventoDataDto[];

  @ApiProperty({
    description: 'IDs de los terneros que participarán en TODOS los eventos',
    example: [1, 2, 3],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  id_ternero?: number[];

  @ApiProperty({
    description: 'IDs de las madres que participarán en TODOS los eventos',
    example: [1, 2],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  id_madre?: number[];
}
