import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateDiarreaTerneroDto {
  @ApiProperty({
    description: 'Fecha en que ocurrió la diarrea',
    example: '2024-02-27',
  })
  @IsNotEmpty()
  @IsDateString()
  fecha_diarrea_ternero: string;

  @ApiProperty({
    description: 'Severidad de la diarrea',
    example: 'Moderada',
    enum: ['Leve', 'Moderada', 'Severa', 'Crítica'],
  })
  @IsNotEmpty()
  @IsString()
  severidad: string;

  @ApiProperty({
    description: 'RP (Registro Pecuario) del ternero afectado',
    example: 'RP-2024-001',
  })
  @IsNotEmpty()
  @IsString()
  rp_ternero: string;

  @ApiProperty({
    description: 'Número de episodio de diarrea para este ternero (contador)',
    example: 1,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'El número de episodio debe ser mayor a 0' })
  numero_episodio: number;

  @ApiProperty({
    description: 'Observaciones adicionales sobre el episodio',
    example:
      'Ternero presenta deshidratación leve, se inició tratamiento con suero oral',
    required: false,
  })
  @IsString()
  observaciones?: string;
}
