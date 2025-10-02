import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DiarreaTernerosService } from './diarrea-terneros.service';
import { CreateDiarreaTerneroDto } from './dto/create-diarrea-ternero.dto';
import { UpdateDiarreaTerneroDto } from './dto/update-diarrea-ternero.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiBearerAuth() 
@UseGuards(JwtAuthGuard)
@ApiTags('Diarrea-terneros')
@Controller('diarrea-terneros')
export class DiarreaTernerosController {
  constructor(private readonly diarreaTernerosService: DiarreaTernerosService) {}

  @Post('crear-diarrea-ternero')
    @ApiOperation({
      summary:
        'servicio para crear una diarrea ternero',
    })
    @ApiBody({ type: CreateDiarreaTerneroDto })
    async create(@Body() createDiarreaTerneroDto: CreateDiarreaTerneroDto) {
      return this.diarreaTernerosService.create(createDiarreaTerneroDto);
    }
  
    @Get('/obtener-listado-diarrea-terneros')
    @ApiOperation({
      summary:
        'Este servicio trae listado de diarrea terneros',
    })
    async findAll() {
      return this.diarreaTernerosService.findAll();
    }
  
    @Get('/get-diarrea-ternero-by-id/:id_diarrea_ternero')
    @ApiOperation({
       summary: 'Devuelve una diarrea por id_diarrea_ternero' 
    })
    @ApiParam({
      name: 'id_diarrea_ternero',
      description: 'Código único id_diarrea_ternero de la diarrea',
    })
    async findOne(@Param('id_diarrea_ternero') id_diarrea_ternero: string) {
      return this.diarreaTernerosService.findOne(+id_diarrea_ternero);
    }
  
    @Patch('/patch-diarrea-ternero-by-id/:id_diarrea_ternero')
    @ApiOperation({
      summary:
        'servicio para actualizar una diarrea por id_diarrea_ternero',
    })
    @ApiParam({
      name: 'id_diarrea_ternero',
      description: 'Código único id_diarrea_ternero',
    })
    @ApiBody({ type: UpdateDiarreaTerneroDto })
    async update(@Param('id_diarrea_ternero') id_diarrea_ternero: string, @Body() updateDiarreaTerneroDto: UpdateDiarreaTerneroDto) {
      return this.diarreaTernerosService.update(+id_diarrea_ternero, updateDiarreaTerneroDto);
    }
  
    @Delete('/delete-ternero-by-id/:id_diarrea_ternero')
    @ApiOperation({
      summary:
        'Proceso que  elimina a una diarrea por id_diarrea_ternero',
    })
    @ApiParam({
      name: 'id_diarrea_ternero',
      description: 'Código único id_diarrea_ternero.',
    })
    async remove(@Param('id_diarrea_ternero') id_diarrea_ternero: string) {
      return this.diarreaTernerosService.remove(+id_diarrea_ternero);
    }
}
