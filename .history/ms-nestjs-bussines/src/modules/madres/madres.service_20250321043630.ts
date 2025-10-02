import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMadreDto } from './dto/create-madre.dto';
import { UpdateMadreDto } from './dto/update-madre.dto';
import { MadreEntity } from './entities/madre.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TerneroEntity } from '../terneros/entities/ternero.entity';
import { PadreEntity } from '../padres/entities/padre.entity';


@Injectable()
export class MadresService {
  constructor(
    @InjectRepository(MadreEntity)
    private readonly madreRepository:Repository<MadreEntity>,
    @InjectRepository(TerneroEntity)
    private readonly terneroRepository:Repository<TerneroEntity>,
    @InjectRepository(PadreEntity)
    private readonly padreRepository:Repository<PadreEntity>
  ){}
  async create(createMadreDto: CreateMadreDto) {
    try {
        if(createMadreDto){

          // Buscar todos los padres con los IDs proporcionados
          const padres = createMadreDto.id_padre
          ? await this.padreRepository.findBy({ id_padre: In(createMadreDto.id_padre) })
          : [];

          
          // Crear el evento con los datos proporcionados
          const resCreateMadre = this.madreRepository.create({
              ...createMadreDto,
              padres,  //  Asignamos el array de padres
          });
          const madreSave = await this.madreRepository.save(resCreateMadre);
          return madreSave;
        }
    } catch (error) {
      throw new HttpException(`Error al crear la madre: ${error.message}`, HttpStatus.CONFLICT);
    }
  }


  async findAll(): Promise<MadreEntity[]> {
    try {
      const madres = await this.madreRepository.find({
        relations: ['terneros','padres','eventos'], // Esto funcionará solo si la relación está bien definida
      });
      return madres;
    } catch (error) {
      throw new HttpException(
        `Error al obtener las madres: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  async findOne(id: number): Promise<MadreEntity> {
    try {
      const madre = await this.madreRepository.findOne({
        where: { id_madre:id }, // Asegúrate de usar "id" y no "id_madre"
        relations: ['terneros','padres','eventos'],
      });
  
      if (!madre) {
        throw new HttpException('Madre no encontrada', HttpStatus.NOT_FOUND);
      }
  
      return madre;
    } catch (error) {
      throw new HttpException(
        `Error al obtener la madre con ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  

  async update(id: number, updateMadreDto: UpdateMadreDto): Promise<MadreEntity> {
    try {
      // Buscar la madre por ID
      const madre = await this.madreRepository.findOne({where:{
        id_madre:id
      }});

      // Si no se encuentra la madre, lanzamos una excepción con un error 404
      if (!madre) {
        throw new HttpException('Madre no encontrada', HttpStatus.NOT_FOUND);
      }

      //buscamos si dto tiene algun padres ids
      const padresArray = updateMadreDto.id_padre ? await this.padreRepository.findBy({id_padre:In(updateMadreDto.id_padre)})
      :[];

      madre.padres=padresArray;

      // Actualizar la madre con los datos proporcionados
      const updatedMadre = Object.assign(madre, updateMadreDto);
      const savedMadre = await this.madreRepository.save(updatedMadre);

      return savedMadre;
    } catch (error) {
      // Si ocurre algún error, lanzamos una excepción con un error 500
      throw new HttpException(`Error al actualizar la madre con ID ${id}: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      // Buscar la madre
      const madre = await this.madreRepository.findOne({ where: {id_madre: id } });
  
      if (!madre) {
        throw new HttpException('Madre no encontrada', HttpStatus.NOT_FOUND);
      }
  
      // Eliminar la madre (los terneros quedarán con madreId = NULL)
      await this.madreRepository.remove(madre);
  
      return { message: 'Madre eliminada con éxito, pero sus terneros siguen existiendo' };
    } catch (error) {
      throw new HttpException(
        `Error al eliminar la madre con ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  
  
}
