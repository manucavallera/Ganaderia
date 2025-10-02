import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TernerosTratamientosService } from './terneros-tratamientos.service';
import { CreateTernerosTratamientoDto } from './dto/create-terneros-tratamiento.dto';
import { UpdateTernerosTratamientoDto } from './dto/update-terneros-tratamiento.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth() 
@UseGuards(JwtAuthGuard)
@ApiTags('Terneros-tratamientos')
@Controller('terneros-tratamientos')
export class TernerosTratamientosController {
  constructor(private readonly ternerosTratamientosService: TernerosTratamientosService) {}

    @Post('crear-tratamiento-ternero')
    @ApiOperation({
      summary:
        'servicio para crear un tratamiento ternero',
    })
    @ApiBody({ type: CreateTernerosTratamientoDto })
    async create(@Body() createTernerosTratamientoDto: CreateTernerosTratamientoDto) {
      return this.ternerosTratamientosService.create(createTernerosTratamientoDto);
    }
  
    @Get('/obtener-listado-tratamientos-terneros')
    @ApiOperation({
      summary:
        'Este servicio trae listado de todos los tratamientos terneros',
    })
    async findAll() {
      return this.ternerosTratamientosService.findAll();
    }
  
    @Get('/get-tratamiento-ternero-by-id/:id_ternero_tratamiento')
    @ApiOperation({ 
      summary: 'Devuelve un tratamiento ternero por id_ternero_tratamiento' 
    })
    @ApiParam({
      name: 'id_ternero_tratamiento',
      description: 'Código único id del tratamiento ternero',
    })
    async findOne(@Param('id_ternero_tratamiento') id_ternero_tratamiento: string) {
      return this.ternerosTratamientosService.findOne(+id_ternero_tratamiento);
    }
  
    @Patch('/patch-tratamiento-ternero-by-id/:id_ternero_tratamiento')
    @ApiOperation({
      summary:
        'servicio para actualizar una madre por id_ternero_tratamiento',
    })
    @ApiParam({
      name: 'id_ternero_tratamiento',
      description: 'Código único id_ternero_tratamiento',
    })
    @ApiBody({ type: UpdateTernerosTratamientoDto })
    async update(@Param('id_ternero_tratamiento') id_ternero_tratamiento: string, @Body() updateTernerosTratamientoDto: UpdateTernerosTratamientoDto) {
      return this.ternerosTratamientosService.update(+id_ternero_tratamiento, updateTernerosTratamientoDto);
    }
  
    @Delete('/delete-tratamiento-ternero-by-id/:id_ternero_tratamiento')
    @ApiOperation({
      summary:
        'Proceso que elimina a madre por id_ternero_tratamiento',
    })
    @ApiParam({
      name: 'id_ternero_tratamiento',
      description: 'Código único id_ternero_tratamiento.',
    })
    async remove(@Param('id_ternero_tratamiento') id_ternero_tratamiento: string) {
      return this.ternerosTratamientosService.remove(+id_ternero_tratamiento);
    }
}
