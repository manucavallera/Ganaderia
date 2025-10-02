import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTernerosTratamientoDto } from './dto/create-terneros-tratamiento.dto';
import { UpdateTernerosTratamientoDto } from './dto/update-terneros-tratamiento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TerneroTratamientoEntity } from './entities/terneros-tratamiento.entity';
import { Repository } from 'typeorm';
import { TerneroEntity } from '../terneros/entities/ternero.entity';
import { TratamientoEntity } from '../tratamientos/entities/tratamiento.entity';

@Injectable()
export class TernerosTratamientosService {
  constructor(
    @InjectRepository(TerneroTratamientoEntity)
    private readonly terneroTratamientoRepository:Repository<TerneroTratamientoEntity>,
    @InjectRepository(TerneroEntity)
    private readonly terneroRepository:Repository<TerneroEntity>,
    @InjectRepository(TratamientoEntity)
    private readonly tratamientoRepository:Repository<TratamientoEntity>
  ){}

  async create(createTernerosTratamientoDto: CreateTernerosTratamientoDto): Promise<TerneroTratamientoEntity> {
      
    // Buscar al ternero en la base de datos
      const ternero = await this.terneroRepository.findOne({
          where: { id_ternero: createTernerosTratamientoDto.id_ternero },
      });

      if (!ternero) {
          throw new Error(`No se encontró el ternero con el ID ${createTernerosTratamientoDto.id_ternero}`);
      }

      // Buscar el tratamiento en la base de datos
      const tratamiento = await this.tratamientoRepository.findOne({
          where: { id_tratamiento: createTernerosTratamientoDto.id_tratamiento },
      });

      if (!tratamiento) {
          throw new Error(`No se encontró el tratamiento con el ID ${createTernerosTratamientoDto.id_tratamiento}`);
      }

      // Crear el tratamiento terneros y asignar al ternero con el tratamiento
      const nuevoTratamientoTernero = this.terneroTratamientoRepository.create({
          ...createTernerosTratamientoDto,
          ternero,  // Asigna la relación con la madre
          tratamiento // Asigna la relación con el tratamiento
      });

      return this.terneroTratamientoRepository.save(nuevoTratamientoTernero);
  }

  
  async findAll(): Promise<TerneroTratamientoEntity[]> {
        try {
          const terneroList = await this.terneroTratamientoRepository.find({
            relations:['ternero','tratamiento']
          });
          return terneroList;
        } catch (error) {
    
          throw new HttpException(`Error al obtener los tratamientos terneros: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }
  
    async findOne(id: number): Promise<TerneroTratamientoEntity> {
      try {
  
        const tratamientoTerneros = await this.terneroTratamientoRepository.findOne({where:{id_ternero_tratamiento:id},
        relations:['ternero','tratamiento']
        });
  
        if (!tratamientoTerneros) {
          throw new HttpException('Tratamiento Terneros no encontrado', HttpStatus.NOT_FOUND);
        }
  
        return tratamientoTerneros;
      } catch (error) {
     
        throw new HttpException(`Error al obtener el Tratamiento Ternero con el ID ${id}: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    async update(id: number, updateTernerosTratamientoDto: UpdateTernerosTratamientoDto): Promise<TerneroTratamientoEntity> {
     
      try {

        // Buscar el ternero por ID
        const tratamientoTernero = await this.terneroTratamientoRepository.findOne({
          where: { id_ternero_tratamiento: id },
          relations: ['ternero','tratamiento'], // Asegura que la relación ternero se cargue y tratamiento
        });
    
        if (!tratamientoTernero) {
          throw new HttpException('Tratamiento ternero no encontrado', HttpStatus.NOT_FOUND);
        }
    
        // Si el DTO contiene un nuevo id_ternero, buscamos al ternero
        if (updateTernerosTratamientoDto.id_ternero) {
          const ternero = await this.terneroRepository.findOne({
            where: { id_ternero: updateTernerosTratamientoDto.id_ternero },
          });
    
          if (!ternero) {
            throw new HttpException('La nueva madre no existe', HttpStatus.NOT_FOUND);
          }
    
          tratamientoTernero.ternero = ternero; // Asignamos la nueva madre
        }

        // Si el DTO contiene un nuevo id_ternero, buscamos al ternero
        if (updateTernerosTratamientoDto.id_ternero) {
          const ternero = await this.terneroRepository.findOne({
            where: { id_ternero: updateTernerosTratamientoDto.id_ternero },
          });
    
          if (!ternero) {
            throw new HttpException('El nuevo ternero no existe', HttpStatus.NOT_FOUND);
          }
    
          tratamientoTernero.ternero = ternero; // Asignamos la nueva madre
        }


        // Si el DTO contiene un nuevo id_tratamiento, buscamos al tratamiento
        if (updateTernerosTratamientoDto.id_tratamiento) {
            const tratamiento = await this.tratamientoRepository.findOne({
              where: { id_tratamiento: updateTernerosTratamientoDto.id_tratamiento },
        });
        
        if (!tratamiento) {
            throw new HttpException('El nuevo tratamiento no existe', HttpStatus.NOT_FOUND);
        }
        
              tratamientoTernero.tratamiento = tratamiento; // Asignamos la nueva madre
        }
    
        // Actualizamos otros campos del tratamiento ternero
        Object.assign(tratamientoTernero, updateTernerosTratamientoDto);
    
        return await this.terneroTratamientoRepository.save(tratamientoTernero);
      } catch (error) {
        throw new HttpException(
          `Error al actualizar el ternero con ID ${id}: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    
  
    async remove(id: number): Promise<{ message: string }> {
      try {
        // Buscar la tratamiento ternero por ID
        const tratamientoTernero = await this.terneroTratamientoRepository.findOne({where:{
          id_ternero_tratamiento:id
        }});
  
        // Si no se encuentra tratamiento ternero lanzamos una excepción con un error 404
        if (!tratamientoTernero) {
          throw new HttpException('Tratamiento ternero no encontrado', HttpStatus.NOT_FOUND);
        }
  
        // Eliminar la Tratamiento ternero
        await this.terneroTratamientoRepository.remove(tratamientoTernero);
  
        return { message: 'Tratamiento Ternero eliminado con éxito' };
      } catch (error) {
      
        throw new HttpException(`Error al eliminar el Tratamiento Ternero con ID ${id}: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
}
