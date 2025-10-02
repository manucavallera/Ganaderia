import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTerneroDto {
  @ApiProperty({ description: 'Número de RP del ternero', example: 101 })
  @IsNotEmpty()
  @IsNumber()
  rp_ternero: number;

  @ApiProperty({
    description: 'Sexo del ternero',
    example: 'Macho',
    enum: ['Macho', 'Hembra'],
  })
  @IsNotEmpty()
  @IsEnum(['Macho', 'Hembra'])
  sexo: string;

  @ApiProperty({
    description: 'Estado del ternero',
    example: 'Vivo',
    enum: ['Vivo', 'Muerto'],
  })
  @IsNotEmpty()
  @IsEnum(['Vivo', 'Muerto'])
  estado: string;

  @ApiProperty({ description: 'Peso al nacer en kg', example: 35.2 })
  @IsNotEmpty()
  @IsNumber()
  peso_nacer: number;

  @ApiProperty({ description: 'Peso a los 15 días en kg', example: 42.5 })
  @IsNotEmpty()
  @IsNumber()
  peso_15d: number;

  @ApiProperty({ description: 'Peso a los 30 días en kg', example: 51.3 })
  @IsNotEmpty()
  @IsNumber()
  peso_30d: number;

  @ApiProperty({ description: 'Peso a los 45 días en kg', example: 60.1 })
  @IsNotEmpty()
  @IsNumber()
  peso_45d: number;

  @ApiProperty({ description: 'Peso al ser largado en kg', example: 80.0 })
  @IsNotEmpty()
  @IsNumber()
  peso_largado: number;

  @ApiProperty({
    description: 'Peso ideal del ternero (doble del peso al nacer)',
    example: 70.4,
  })
  @IsNotEmpty()
  @IsNumber()
  peso_ideal: number;

  @ApiProperty({
    description:
      'Historial de pesajes diarios (formato: fecha:peso|fecha:peso)',
    example: '04/07:37.5|05/07:38.1|06/07:38.7',
    required: false,
  })
  @IsOptional()
  @IsString()
  estimativo?: string;

  @ApiProperty({
    description: 'Observaciones sobre el ternero',
    example: 'Buen desarrollo y crecimiento',
  })
  @IsNotEmpty()
  @IsString()
  observaciones: string;

  @ApiProperty({
    description: 'Fecha de nacimiento del ternero',
    example: '2024-02-27',
  })
  @IsNotEmpty()
  @IsDateString()
  fecha_nacimiento: string;

  @ApiProperty({
    description: 'Tipo de semen utilizado',
    example: 'Semen Angus Premium A123',
  })
  @IsNotEmpty()
  @IsString()
  semen: string;

  @ApiProperty({
    description: 'ID de la madre a la que pertenece el ternero',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  id_madre: number;
}

// Nuevo DTO para agregar peso diario
export class AddPesoDiarioDto {
  @ApiProperty({
    description: 'Peso actual del ternero en kg',
    example: 32.5,
  })
  @IsNotEmpty()
  @IsNumber()
  peso_actual: number;

  @ApiProperty({
    description: 'Fecha del pesaje (opcional, si no se envía usa fecha actual)',
    example: '2024-12-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fecha?: string;
}

// DTO para respuesta del historial de pesos
export class PesoDiarioResponseDto {
  @ApiProperty({ description: 'Fecha del pesaje', example: '15/12' })
  fecha: string;

  @ApiProperty({ description: 'Peso en kg', example: 32.5 })
  peso: number;
}

export class HistorialPesosResponseDto {
  @ApiProperty({ description: 'ID del ternero', example: 1 })
  id_ternero: number;

  @ApiProperty({ description: 'Número RP del ternero', example: 101 })
  rp_ternero: number;

  @ApiProperty({ description: 'Peso al nacer', example: 30.0 })
  peso_nacer: number;

  @ApiProperty({
    description: 'Peso actual (último registrado)',
    example: 32.5,
  })
  ultimo_peso: number;

  @ApiProperty({ description: 'Fecha del último pesaje', example: '15/12' })
  ultimo_pesaje_fecha: string;

  @ApiProperty({
    description: 'Historial completo de pesos',
    type: [PesoDiarioResponseDto],
  })
  historial_pesos: PesoDiarioResponseDto[];

  @ApiProperty({
    description: 'Ganancia total desde nacimiento',
    example: 12.3,
  })
  ganancia_total: number;

  @ApiProperty({ description: 'Promedio ganancia diaria', example: 0.41 })
  aumento_diario_promedio: number;

  @ApiProperty({ description: 'Días desde nacimiento', example: 30 })
  dias_desde_nacimiento: number;
}
