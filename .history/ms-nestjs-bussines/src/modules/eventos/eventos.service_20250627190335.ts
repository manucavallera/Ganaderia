import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateEventoDto } from './dto/create-evento.dto';
import { CreateMultipleEventosDto } from './dto/create-multiple-eventos.dto'; // ⬅️ IMPORT AGREGADO
import { UpdateEventoDto } from './dto/update-evento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EventoEntity } from './entities/evento.entity';
import { In, Repository } from 'typeorm';
import { MadreEntity } from '../madres/entities/madre.entity';
import { TerneroEntity } from '../terneros/entities/ternero.entity';

@Injectable()
export class EventosService {
  constructor(
    @InjectRepository(EventoEntity)
    private readonly eventoRepository: Repository<EventoEntity>,
    @InjectRepository(TerneroEntity)
    private readonly terneroRepository: Repository<TerneroEntity>,
    @InjectRepository(MadreEntity)
    private readonly madreRepository: Repository<MadreEntity>,
  ) {}

  async create(createEventoDto: CreateEventoDto): Promise<EventoEntity> {
    try {
      // Buscar todos los terneros con los IDs proporcionados
      const terneros = createEventoDto.id_ternero
        ? await this.terneroRepository.findBy({
            id_ternero: In(createEventoDto.id_ternero),
          })
        : [];

      // Buscar todas las madres con los IDs proporcionados
      const madres = createEventoDto.id_madre
        ? await this.madreRepository.findBy({
            id_madre: In(createEventoDto.id_madre),
          })
        : [];

      // Crear el evento con los datos proporcionados
      const eventoCreated = this.eventoRepository.create({
        ...createEventoDto,
        terneros, //  Asignamos el array de terneros
        madres, //  Asignamos el array de madres
      });

      // Guardar en la base de datos
      return await this.eventoRepository.save(eventoCreated);
    } catch (error) {
      throw new HttpException(
        `Error al crear el evento: ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  // ⬅️ MÉTODO CORREGIDO CON EL TIPO CORRECTO
  async createMultiple(
    createEventosData: CreateMultipleEventosDto,
  ): Promise<EventoEntity[]> {
    try {
      // Buscar todos los terneros una vez
      const terneros =
        createEventosData.id_ternero?.length > 0
          ? await this.terneroRepository.findBy({
              id_ternero: In(createEventosData.id_ternero),
            })
          : [];

      // Buscar todas las madres una vez
      const madres =
        createEventosData.id_madre?.length > 0
          ? await this.madreRepository.findBy({
              id_madre: In(createEventosData.id_madre),
            })
          : [];

      // Crear todos los eventos
      const eventosCreated = createEventosData.eventos.map((eventoDto) =>
        this.eventoRepository.create({
          fecha_evento: eventoDto.fecha_evento,
          observacion: eventoDto.observacion,
          terneros, // Mismos terneros para todos los eventos
          madres, // Mismas madres para todos los eventos
        }),
      );

      // Guardar todos los eventos de una vez
      return await this.eventoRepository.save(eventosCreated);
    } catch (error) {
      throw new HttpException(
        `Error al crear múltiples eventos: ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async findAll(): Promise<EventoEntity[]> {
    try {
      const eventos = await this.eventoRepository.find({
        relations: ['terneros', 'madres'],
      });
      return eventos;
    } catch (error) {
      throw new HttpException(
        `Error al obtener los eventos: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<EventoEntity> {
    try {
      const evento = await this.eventoRepository.findOne({
        where: { id_evento: id },
        relations: ['terneros', 'madres'],
      });

      if (!evento) {
        throw new HttpException('evento no encontrado', HttpStatus.NOT_FOUND);
      }

      return evento;
    } catch (error) {
      throw new HttpException(
        `Error al obtener el evento con ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: number,
    updateEventoDto: UpdateEventoDto,
  ): Promise<EventoEntity> {
    try {
      // Buscar el evento por ID
      const evento = await this.eventoRepository.findOne({
        where: { id_evento: id },
        relations: ['terneros', 'madres'],
      });

      // Si no se encuentra el evento, lanzamos una excepción con un error 404
      if (!evento) {
        throw new HttpException('Evento no encontrado', HttpStatus.NOT_FOUND);
      }

      //buscamos si dto tiene algun ternero ids
      const ternerosArray = updateEventoDto.id_ternero
        ? await this.terneroRepository.findBy({
            id_ternero: In(updateEventoDto.id_ternero),
          })
        : [];

      //buscamos si el dto tiene algunas madres ids
      const madresArray = updateEventoDto.id_madre
        ? await this.madreRepository.findBy({
            id_madre: In(updateEventoDto.id_madre),
          })
        : [];

      // Actualizar los valores del evento
      if (updateEventoDto.fecha_evento)
        evento.fecha_evento = new Date(updateEventoDto.fecha_evento);
      if (updateEventoDto.observacion)
        evento.observacion = updateEventoDto.observacion;
      evento.terneros = ternerosArray;
      evento.madres = madresArray;

      // Guardar los cambios directamente en la base de datos
      return await this.eventoRepository.save(evento);
    } catch (error) {
      // Si ocurre algún error, lanzamos una excepción con un error 500
      throw new HttpException(
        `Error al actualizar el evento con el ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      // Buscar el evento por ID
      const evento = await this.eventoRepository.findOne({
        where: {
          id_evento: id,
        },
      });

      // Si no se encuentra el evento, lanzamos una excepción con un error 404
      if (!evento) {
        throw new HttpException('Evento no encontrado', HttpStatus.NOT_FOUND);
      }

      // Eliminar el evento
      await this.eventoRepository.remove(evento);

      return { message: 'El evento fue eliminado con éxito' };
    } catch (error) {
      throw new HttpException(
        `Error al eliminar el evento con el ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
