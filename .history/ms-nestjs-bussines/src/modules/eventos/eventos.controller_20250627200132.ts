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
import { EventosService } from './eventos.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { CreateMultipleEventosDto } from './dto/create-multiple-eventos.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Eventos-terneros')
@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Post('crear-evento')
  @ApiOperation({
    summary: 'Servicio para crear un evento individual',
  })
  @ApiBody({ type: CreateEventoDto })
  async create(@Body() createEventoDto: CreateEventoDto) {
    return this.eventosService.create(createEventoDto);
  }

  // ⬅️ ENDPOINT CORREGIDO: Descripción actualizada
  @Post('crear-multiples-eventos')
  @ApiOperation({
    summary: 'Servicio para crear múltiples eventos de una vez',
    description:
      'Permite crear varios eventos simultáneamente. Cada evento puede tener sus propios terneros y madres específicos.',
  })
  @ApiBody({
    type: CreateMultipleEventosDto,
    description: 'Array de eventos, cada uno con sus propios animales',
    examples: {
      ejemplo: {
        summary: 'Ejemplo de múltiples eventos',
        value: {
          eventos: [
            {
              fecha_evento: '2024-06-01',
              observacion: 'Vacunación grupo A',
              id_ternero: [1, 2, 3],
              id_madre: [1, 2],
            },
            {
              fecha_evento: '2024-06-05',
              observacion: 'Control veterinario grupo B',
              id_ternero: [4, 5, 6],
              id_madre: [3, 4],
            },
          ],
        },
      },
    },
  })
  async createMultiple(
    @Body() createMultipleEventosDto: CreateMultipleEventosDto,
  ) {
    return this.eventosService.createMultiple(createMultipleEventosDto);
  }

  @Get('/obtener-listado-eventos')
  @ApiOperation({
    summary: 'Este servicio trae listado de todos los eventos',
  })
  async findAll() {
    return this.eventosService.findAll();
  }

  @Get('/get-evento-by-id/:id_evento')
  @ApiOperation({
    summary: 'Devuelve un evento por id_evento',
  })
  @ApiParam({
    name: 'id_evento',
    description: 'Código único id del evento',
  })
  async findOne(@Param('id_evento') id_evento: string) {
    return this.eventosService.findOne(+id_evento);
  }

  @Patch('/patch-evento-by-id/:id_evento')
  @ApiOperation({
    summary: 'Servicio para actualizar un evento por id_evento',
  })
  @ApiParam({
    name: 'id_evento',
    description: 'Código único id_evento',
  })
  @ApiBody({ type: UpdateEventoDto })
  async update(
    @Param('id_evento') id_evento: string,
    @Body() updateEventoDto: UpdateEventoDto,
  ) {
    return this.eventosService.update(+id_evento, updateEventoDto);
  }

  @Delete('/delete-evento-by-id/:id_evento')
  @ApiOperation({
    summary: 'Proceso que elimina un evento por id_evento',
  })
  @ApiParam({
    name: 'id_evento',
    description: 'Código único id_evento.',
  })
  async remove(@Param('id_evento') id_evento: string) {
    return this.eventosService.remove(+id_evento);
  }
}
