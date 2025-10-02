import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateDiarreaTerneroDto } from './dto/create-diarrea-ternero.dto';
import { UpdateDiarreaTerneroDto } from './dto/update-diarrea-ternero.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DiarreaTerneroEntity } from './entities/diarrea-ternero.entity';
import { Repository } from 'typeorm';
import { TerneroEntity } from '../terneros/entities/ternero.entity';

@Injectable()
export class DiarreaTernerosService {
  constructor(
    @InjectRepository(DiarreaTerneroEntity)
    private readonly diarreaRepository: Repository<DiarreaTerneroEntity>,
    @InjectRepository(TerneroEntity)
    private readonly terneroRepository: Repository<TerneroEntity>,
  ) {}
  async create(
    createDiarreaTerneroDto: CreateDiarreaTerneroDto,
  ): Promise<DiarreaTerneroEntity> {
    // Buscar la madre en la base de datos
    const ternero = await this.terneroRepository.findOne({
      where: { id_ternero: createDiarreaTerneroDto.id_ternero },
    });

    if (!ternero) {
      throw new Error(
        `No se encontró el ternero con el ID ${createDiarreaTerneroDto.id_ternero}`,
      );
    }

    // Crear la diarrea y asignar al ternero
    const nuevaDiarreaTernero = this.diarreaRepository.create({
      ...createDiarreaTerneroDto,
      ternero, // Asigna la relación con el ternero
    });

    return this.diarreaRepository.save(nuevaDiarreaTernero);
  }

  async findAll(): Promise<DiarreaTerneroEntity[]> {
    try {
      const terneroList = await this.diarreaRepository.find({
        relations: ['ternero'],
      });
      return terneroList;
    } catch (error) {
      throw new HttpException(
        `Error al obtener todas las diarreas: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<DiarreaTerneroEntity> {
    try {
      const diarreaTernero = await this.diarreaRepository.findOne({
        where: { id_diarrea_ternero: id },
        relations: ['ternero'],
      });

      if (!diarreaTernero) {
        throw new HttpException('Diarrea no encontrada', HttpStatus.NOT_FOUND);
      }

      return diarreaTernero;
    } catch (error) {
      throw new HttpException(
        `Error al obtener la diarrea con el ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: number,
    updateDiarreaTerneroDto: UpdateDiarreaTerneroDto,
  ): Promise<DiarreaTerneroEntity> {
    try {
      // Buscar el ternero por ID
      const diarreaTernero = await this.diarreaRepository.findOne({
        where: { id_diarrea_ternero: id },
        relations: ['ternero'], // Asegura que la relación ternero se cargue
      });

      if (!diarreaTernero) {
        throw new HttpException(
          'Diarrea Ternero no encontrada',
          HttpStatus.NOT_FOUND,
        );
      }

      // Si el DTO contiene un nueva id_ternero, buscamos al ternero
      if (updateDiarreaTerneroDto.id_ternero) {
        const nuevoTernero = await this.terneroRepository.findOne({
          where: { id_ternero: updateDiarreaTerneroDto.id_ternero },
        });

        if (!nuevoTernero) {
          throw new HttpException(
            'La nueva madre no existe',
            HttpStatus.NOT_FOUND,
          );
        }

        diarreaTernero.ternero = nuevoTernero; // Asignamos el nuevo ternero
      }

      // Actualizamos otros campos de la diarrea
      Object.assign(diarreaTernero, updateDiarreaTerneroDto);

      return await this.diarreaRepository.save(diarreaTernero);
    } catch (error) {
      throw new HttpException(
        `Error al actualizar la diarrea con ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      // Buscar la diarrea por ID
      const diarrea = await this.diarreaRepository.findOne({
        where: {
          id_diarrea_ternero: id,
        },
      });

      // Si no se encuentra la diarrea, lanzamos una excepción con un error 404
      if (!diarrea) {
        throw new HttpException('diarrea no encontrado', HttpStatus.NOT_FOUND);
      }

      // Eliminar la diarrea
      await this.diarreaRepository.remove(diarrea);

      return { message: 'Diarrea eliminada con éxito' };
    } catch (error) {
      throw new HttpException(
        `Error al eliminar la diarrea con ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
