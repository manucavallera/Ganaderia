import { PartialType } from '@nestjs/swagger';
import { CreateTerneroDto } from '@./;
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

export class UpdateTerneroDto extends PartialType(CreateTerneroDto) {
  @ApiProperty({
    description: 'Número de RP del ternero',
    example: 101,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  rp_ternero?: number;

  @ApiProperty({
    description: 'Sexo del ternero',
    example: 'Macho',
    enum: ['Macho', 'Hembra'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['Macho', 'Hembra'])
  sexo?: string;

  @ApiProperty({
    description: 'Estado del ternero',
    example: 'Vivo',
    enum: ['Vivo', 'Muerto'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['Vivo', 'Muerto'])
  estado?: string;

  @ApiProperty({
    description: 'Peso al nacer en kg',
    example: 35.2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  peso_nacer?: number;

  @ApiProperty({
    description: 'Peso a los 15 días en kg',
    example: 42.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  peso_15d?: number;

  @ApiProperty({
    description: 'Peso a los 30 días en kg',
    example: 51.3,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  peso_30d?: number;

  @ApiProperty({
    description: 'Peso a los 45 días en kg',
    example: 60.1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  peso_45d?: number;

  @ApiProperty({
    description: 'Peso al ser largado en kg',
    example: 80.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  peso_largado?: number;

  @ApiProperty({
    description: 'Peso ideal del ternero',
    example: 70.4,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  peso_ideal?: number;

  @ApiProperty({
    description: 'Observaciones sobre el ternero',
    example: 'Buen desarrollo y crecimiento',
    required: false,
  })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiProperty({
    description: 'Fecha de nacimiento del ternero',
    example: '2024-02-27',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: string;

  @ApiProperty({
    description: 'Tipo de semen utilizado',
    example: 'Semen Angus Premium A123',
    required: false,
  })
  @IsOptional()
  @IsString()
  semen?: string;

  // ==================== CAMPOS DE CALOSTRADO ====================
  @ApiProperty({
    description: 'Método de administración del calostrado',
    enum: ['sonda', 'mamadera'],
    example: 'mamadera',
    required: false,
  })
  @IsOptional()
  @IsEnum(['sonda', 'mamadera'])
  metodo_calostrado?: string;

  @ApiProperty({
    description: 'Litros de calostrado administrados',
    example: 2.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  litros_calostrado?: number;

  @ApiProperty({
    description: 'Fecha y hora de administración del calostrado',
    example: '2024-12-15T08:30:00',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fecha_hora_calostrado?: string;

  @ApiProperty({
    description: 'Observaciones sobre la administración del calostrado',
    example: 'Se administró sin problemas, el ternero lo aceptó bien',
    required: false,
  })
  @IsOptional()
  @IsString()
  observaciones_calostrado?: string;

  // ==================== NUEVO CAMPO: GRADO BRIX ====================
  @ApiProperty({
    description: 'Grado Brix del calostrado (mide concentración de azúcares)',
    example: 22.5,
    minimum: 0,
    maximum: 50,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'El grado Brix debe ser mayor o igual a 0' })
  @Max(50, { message: 'El grado Brix debe ser menor o igual a 50' })
  grado_brix?: number;
  // ================================================================
}
