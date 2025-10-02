import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMadreDto } from './dto/create-madre.dto';
import { UpdateMadreDto } from './dto/update-madre.dto';
import { MadreEntity } from './entities/madre.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TerneroEntity } from '../terneros/entities/ternero.entity';

@Injectable()
export class MadresService {
  constructor(
    @InjectRepository(MadreEntity)
    private readonly madreRepository: Repository<MadreEntity>,
    @InjectRepository(TerneroEntity)
    private readonly terneroRepository: Repository<TerneroEntity>,
    // ⬅️ ELIMINADO: PadreEntity repository
  ) {}

  async create(createMadreDto: CreateMadreDto) {
    try {
      if (createMadreDto) {
        // ⬅️ ELIMINADO: Lógica de búsqueda y asignación de padres

        // Crear la madre con los datos proporcionados
        const resCreateMadre = this.madreRepository.create(createMadreDto);
        const madreSave = await this.madreRepository.save(resCreateMadre);
        return madreSave;
      }
    } catch (error) {
      throw new HttpException(
        `Error al crear la madre: ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async findAll(): Promise<MadreEntity[]> {
    try {
      const madres = await this.madreRepository.find({
        relations: ['terneros', 'eventos'], // ⬅️ ELIMINADO: 'padres' de relations
      });
      return madres;
    } catch (error) {
      throw new HttpException(
        `Error al obtener las madres: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<MadreEntity> {
    try {
      const madre = await this.madreRepository.findOne({
        where: { id_madre: id },
        relations: ['terneros', 'eventos'], // ⬅️ ELIMINADO: 'padres' de relations
      });

      if (!madre) {
        throw new HttpException('Madre no encontrada', HttpStatus.NOT_FOUND);
      }

      return madre;
    } catch (error) {
      throw new HttpException(
        `Error al obtener la madre con ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: number,
    updateMadreDto: UpdateMadreDto,
  ): Promise<MadreEntity> {
    try {
      // Buscar la madre por ID
      const madre = await this.madreRepository.findOne({
        where: {
          id_madre: id,
        },
      });

      // Si no se encuentra la madre, lanzamos una excepción con un error 404
      if (!madre) {
        throw new HttpException('Madre no encontrada', HttpStatus.NOT_FOUND);
      }

      // ⬅️ ELIMINADO: Lógica de búsqueda y asignación de padres

      // Actualizar la madre con los datos proporcionados
      const updatedMadre = Object.assign(madre, updateMadreDto);
      const savedMadre = await this.madreRepository.save(updatedMadre);

      return savedMadre;
    } catch (error) {
      // Si ocurre algún error, lanzamos una excepción con un error 500
      throw new HttpException(
        `Error al actualizar la madre con ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      // Buscar la madre
      const madre = await this.madreRepository.findOne({
        where: { id_madre: id },
      });

      if (!madre) {
        throw new HttpException('Madre no encontrada', HttpStatus.NOT_FOUND);
      }

      // Eliminar la madre (los terneros quedarán con madreId = NULL)
      await this.madreRepository.remove(madre);

      return {
        message:
          'Madre eliminada con éxito, pero sus terneros siguen existiendo',
      };
    } catch (error) {
      throw new HttpException(
        `Error al eliminar la madre con ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
