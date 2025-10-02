import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';



@ApiBearerAuth() 
@UseGuards(JwtAuthGuard)
@ApiTags('Eventos-terneros')
@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Post('crear-evento')
  @ApiOperation({
    summary:
      'servicio para crear un evento',
  })
  @ApiBody({ type: CreateEventoDto })
  async create(@Body() createEventoDto: CreateEventoDto) {
    return this.eventosService.create(createEventoDto);
  }

  @Get('/obtener-listado-eventos')
  @ApiOperation({
    summary:
      'Este servicio trae listado de todos los eventos',
  })
  async findAll() {
    return this.eventosService.findAll();
  }

  @Get('/get-evento-by-id/:id_evento')
  @ApiOperation({ 
    summary: 'Devuelve una evento por id_evento' 
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
    summary:
      'servicio para actualizar un evento por id_evento',
  })
  @ApiParam({
    name: 'id_evento',
    description: 'Código único id_evento',
  })
  @ApiBody({ type: UpdateEventoDto })
  async update(@Param('id_evento') id_evento: string, @Body() updateEventoDto: UpdateEventoDto) {
    return this.eventosService.update(+id_evento, updateEventoDto);
  }

  @Delete('/delete-evento-by-id/:id_evento')
  @ApiOperation({
    summary:
      'Proceso que elimina a evento por id_evento',
  })
  @ApiParam({
    name: 'id_evento',
    description: 'Código único id_evento.',
  })
  async remove(@Param('id_evento') id_evento: string) {
    return this.eventosService.remove(+id_evento);
  }

}
