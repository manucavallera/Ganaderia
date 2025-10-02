import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TratamientosService } from './tratamientos.service';
import {
  CreateTratamientoDto,
  CreateMultiplesTratamientosDto,
  CreateMultiplesTratamientosResponseDto,
  TurnoTratamiento,
} from './dto/create-tratamiento.dto';
import { UpdateTratamientoDto } from './dto/update-tratamiento.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Tratamientos')
@Controller('tratamientos')
export class TratamientosController {
  constructor(private readonly tratamientosService: TratamientosService) {}

  @Post('crear-tratamiento')
  @ApiOperation({
    summary: 'Servicio para crear un tratamiento',
  })
  @ApiBody({ type: CreateTratamientoDto })
  async create(@Body() createTratamientoDto: CreateTratamientoDto) {
    return this.tratamientosService.create(createTratamientoDto);
  }

  // 🆕 Endpoint para crear múltiples tratamientos
  @Post('crear-multiples-tratamientos')
  @ApiOperation({
    summary: 'Servicio para crear múltiples tratamientos a la vez',
    description:
      'Permite crear varios tratamientos en una sola operación. Útil para cargas masivas o configuraciones iniciales.',
  })
  @ApiBody({
    type: CreateMultiplesTratamientosDto,
    description: 'Array de tratamientos a crear',
    examples: {
      ejemplo_multiple: {
        summary: 'Ejemplo con 3 tratamientos',
        description:
          'Creación de tratamientos para diferentes enfermedades y turnos',
        value: {
          tratamientos: [
            {
              nombre: 'Antibiótico Amoxicilina',
              descripcion:
                'Tratamiento antibiótico para infecciones bacterianas',
              tipo_enfermedad: 'Diarrea bacteriana',
              turno: 'mañana',
              fecha_tratamiento: '2024-12-15',
            },
            {
              nombre: 'Suero Oral Rehidratante',
              descripcion:
                'Solución para rehidratación en casos de deshidratación',
              tipo_enfermedad: 'Deshidratación severa',
              turno: 'tarde',
              fecha_tratamiento: '2024-12-15',
            },
            {
              nombre: 'Expectorante Natural',
              descripcion:
                'Tratamiento natural para aliviar síntomas respiratorios',
              tipo_enfermedad: 'Problemas respiratorios',
              turno: 'mañana',
              fecha_tratamiento: '2024-12-15',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tratamientos creados exitosamente (puede ser parcial)',
    type: CreateMultiplesTratamientosResponseDto,
  })
  async createMultiples(
    @Body() createMultiplesTratamientosDto: CreateMultiplesTratamientosDto,
  ): Promise<CreateMultiplesTratamientosResponseDto> {
    return this.tratamientosService.createMultiples(
      createMultiplesTratamientosDto,
    );
  }

  @Get('/obtener-listado-tratamientos')
  @ApiOperation({
    summary:
      'Este servicio trae listado de todos los tratamientos con filtros opcionales',
  })
  @ApiQuery({
    name: 'tipo_enfermedad',
    required: false,
    type: String,
    description:
      'Filtrar tratamientos por tipo de enfermedad (búsqueda parcial)',
    example: 'diarrea',
  })
  @ApiQuery({
    name: 'turno',
    required: false,
    enum: TurnoTratamiento,
    description: 'Filtrar tratamientos por turno (mañana o tarde)',
  })
  async findAll(
    @Query('tipo_enfermedad') tipoEnfermedad?: string,
    @Query('turno') turno?: TurnoTratamiento,
  ) {
    return this.tratamientosService.findAll(tipoEnfermedad, turno);
  }

  @Get('/obtener-tratamientos-por-enfermedad/:tipo_enfermedad')
  @ApiOperation({
    summary:
      'Obtiene todos los tratamientos para un tipo específico de enfermedad',
  })
  @ApiParam({
    name: 'tipo_enfermedad',
    type: String,
    description: 'Tipo de enfermedad (búsqueda parcial, ejemplo: diarrea)',
  })
  async findByTipoEnfermedad(@Param('tipo_enfermedad') tipoEnfermedad: string) {
    return this.tratamientosService.findByTipoEnfermedad(tipoEnfermedad);
  }

  @Get('/obtener-tratamientos-por-turno/:turno')
  @ApiOperation({
    summary: 'Obtiene todos los tratamientos para un turno específico',
  })
  @ApiParam({
    name: 'turno',
    enum: TurnoTratamiento,
    description: 'Turno del tratamiento (mañana o tarde)',
  })
  async findByTurno(@Param('turno') turno: TurnoTratamiento) {
    return this.tratamientosService.findByTurno(turno);
  }

  @Get('/obtener-tratamientos-por-enfermedad-y-turno/:tipo_enfermedad/:turno')
  @ApiOperation({
    summary: 'Obtiene tratamientos filtrados por tipo de enfermedad y turno',
  })
  @ApiParam({
    name: 'tipo_enfermedad',
    type: String,
    description: 'Tipo de enfermedad (búsqueda parcial)',
  })
  @ApiParam({
    name: 'turno',
    enum: TurnoTratamiento,
    description: 'Turno del tratamiento (mañana o tarde)',
  })
  async findByTipoEnfermedadYTurno(
    @Param('tipo_enfermedad') tipoEnfermedad: string,
    @Param('turno') turno: TurnoTratamiento,
  ) {
    return this.tratamientosService.findByTipoEnfermedadYTurno(
      tipoEnfermedad,
      turno,
    );
  }

  @Get('/get-tratamiento-by-id/:id_tratamiento')
  @ApiOperation({
    summary: 'Devuelve un tratamiento por id_tratamiento',
  })
  @ApiParam({
    name: 'id_tratamiento',
    description: 'Código único id del tratamiento',
  })
  async findOne(@Param('id_tratamiento') id_tratamiento: string) {
    return this.tratamientosService.findOne(+id_tratamiento);
  }

  @Patch('/patch-tratamiento-by-id/:id_tratamiento')
  @ApiOperation({
    summary: 'Servicio para actualizar un tratamiento por id_tratamiento',
  })
  @ApiParam({
    name: 'id_tratamiento',
    description: 'Código único id_tratamiento',
  })
  @ApiBody({ type: UpdateTratamientoDto })
  async update(
    @Param('id_tratamiento') id_tratamiento: string,
    @Body() updateTratamientoDto: UpdateTratamientoDto,
  ) {
    return this.tratamientosService.update(
      +id_tratamiento,
      updateTratamientoDto,
    );
  }

  @Delete('/delete-tratamiento-by-id/:id_tratamiento')
  @ApiOperation({
    summary: 'Proceso que elimina un tratamiento por id_tratamiento',
  })
  @ApiParam({
    name: 'id_tratamiento',
    description: 'Código único id_tratamiento.',
  })
  async remove(@Param('id_tratamiento') id_tratamiento: string) {
    return this.tratamientosService.remove(+id_tratamiento);
  }
}
