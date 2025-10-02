import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TernerosService } from './terneros.service';
import {
  CreateTerneroDto,
  AddPesoDiarioDto,
  HistorialPesosResponseDto,
} from './dto/create-ternero.dto';
import { UpdateTerneroDto } from './dto/update-ternero.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// DTO para agregar pesaje diario (método legacy)
class AgregarPesajeDto {
  fecha: string; // "07/07"
  peso: number; // 39.2
  observaciones?: string;
}

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Terneros')
@Controller('terneros')
export class TernerosController {
  constructor(private readonly ternerosService: TernerosService) {}

  @Post('crear-ternero')
  @ApiOperation({
    summary: 'servicio para crear un ternero',
  })
  @ApiBody({ type: CreateTerneroDto })
  async create(@Body() createTerneroDto: CreateTerneroDto) {
    return this.ternerosService.create(createTerneroDto);
  }

  @Get('/obtener-listado-terneros')
  @ApiOperation({
    summary: 'Este servicio trae listado de todos los terneros',
  })
  async findAll() {
    return this.ternerosService.findAll();
  }

  @Get('/get-ternero-by-id/:id_ternero')
  @ApiOperation({
    summary: 'Devuelve un ternero por id_ternero',
  })
  @ApiParam({
    name: 'id_ternero',
    description: 'Código único id_ternero del ternero',
  })
  async findOne(@Param('id_ternero') id_ternero: string) {
    return this.ternerosService.findOne(+id_ternero);
  }

  @Patch('/patch-ternero-by-id/:id_ternero')
  @ApiOperation({
    summary: 'servicio para actualizar un ternero por id_ternero',
  })
  @ApiParam({
    name: 'id_ternero',
    description: 'Código único id_ternero',
  })
  @ApiBody({ type: UpdateTerneroDto })
  async update(
    @Param('id_ternero') id_ternero: string,
    @Body() updateTerneroDto: UpdateTerneroDto,
  ) {
    return this.ternerosService.update(+id_ternero, updateTerneroDto);
  }

  // NUEVO ENDPOINT: Agregar peso diario (usando el nuevo DTO)
  @Post('/peso-diario/:id_ternero')
  @ApiOperation({
    summary: 'Agregar peso diario del ternero',
    description:
      'Registra el peso actual del ternero para seguimiento diario de crecimiento. Si no se envía fecha, usa la fecha actual.',
  })
  @ApiParam({
    name: 'id_ternero',
    description: 'ID del ternero al que se le agregará el peso',
  })
  @ApiBody({ type: AddPesoDiarioDto })
  @ApiResponse({
    status: 200,
    description: 'Peso agregado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id_ternero: { type: 'number', example: 1 },
        rp_ternero: { type: 'number', example: 101 },
        ultimo_peso: { type: 'number', example: 32.5 },
        aumento_diario_promedio: { type: 'number', example: 0.41 },
        estimativo: {
          type: 'string',
          example: '04/07:37.5|05/07:38.1|15/12:32.5',
        },
      },
    },
  })
  async agregarPesoDiario(
    @Param('id_ternero') id_ternero: string,
    @Body() addPesoDiarioDto: AddPesoDiarioDto,
  ) {
    return this.ternerosService.agregarPesoDiario(
      +id_ternero,
      addPesoDiarioDto,
    );
  }

  // NUEVO ENDPOINT: Obtener historial completo con estadísticas
  @Get('/historial-completo/:id_ternero')
  @ApiOperation({
    summary: 'Obtener historial completo de pesos con estadísticas',
    description:
      'Devuelve el historial completo de pesajes con estadísticas de crecimiento, ganancia total y promedio diario',
  })
  @ApiParam({
    name: 'id_ternero',
    description: 'ID del ternero',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial completo obtenido exitosamente',
    type: HistorialPesosResponseDto,
  })
  async obtenerHistorialCompleto(
    @Param('id_ternero') id_ternero: string,
  ): Promise<HistorialPesosResponseDto> {
    return this.ternerosService.obtenerHistorialCompleto(+id_ternero);
  }

  // ENDPOINT LEGACY: Agregar pesaje diario (mantenido para compatibilidad)
  @Post('/agregar-pesaje/:id_ternero')
  @ApiOperation({
    summary: 'Agregar un pesaje diario al ternero (método legacy)',
    description:
      'Permite registrar el peso diario del ternero para seguimiento de crecimiento. Usa el endpoint /peso-diario para la nueva implementación.',
  })
  @ApiParam({
    name: 'id_ternero',
    description: 'ID del ternero al que se le agregará el pesaje',
  })
  @ApiBody({
    description: 'Datos del pesaje diario',
    schema: {
      type: 'object',
      properties: {
        fecha: {
          type: 'string',
          example: '07/07',
          description: 'Fecha del pesaje en formato dd/mm',
        },
        peso: {
          type: 'number',
          example: 39.2,
          description: 'Peso del ternero en kg',
        },
        observaciones: {
          type: 'string',
          example: 'Ternero muy activo hoy',
          description: 'Observaciones opcionales del pesaje',
        },
      },
      required: ['fecha', 'peso'],
    },
  })
  async agregarPesaje(
    @Param('id_ternero') id_ternero: string,
    @Body() pesajeDto: AgregarPesajeDto,
  ) {
    return this.ternerosService.agregarPesaje(
      +id_ternero,
      pesajeDto.fecha,
      pesajeDto.peso,
      pesajeDto.observaciones,
    );
  }

  // ENDPOINT LEGACY: Obtener historial de pesajes (mantenido para compatibilidad)
  @Get('/historial-pesajes/:id_ternero')
  @ApiOperation({
    summary:
      'Obtener historial simple de pesajes de un ternero (método legacy)',
    description:
      'Devuelve todos los pesajes registrados para el ternero. Usa el endpoint /historial-completo para estadísticas adicionales.',
  })
  @ApiParam({
    name: 'id_ternero',
    description: 'ID del ternero',
  })
  async obtenerHistorialPesajes(@Param('id_ternero') id_ternero: string) {
    return this.ternerosService.obtenerHistorialPesajes(+id_ternero);
  }

  @Delete('/delete-ternero-by-id/:id_ternero')
  @ApiOperation({
    summary: 'Proceso que elimina a ternero por id_ternero',
  })
  @ApiParam({
    name: 'id_ternero',
    description: 'Código único id_ternero.',
  })
  async remove(@Param('id_ternero') id_ternero: string) {
    return this.ternerosService.remove(+id_ternero);
  }
}
