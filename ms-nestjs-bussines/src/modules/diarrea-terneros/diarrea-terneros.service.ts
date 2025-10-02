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
    try {
      // 1. Buscar el ternero por ID (mantenemos la lógica original)
      const ternero = await this.terneroRepository.findOne({
        where: { id_ternero: createDiarreaTerneroDto.id_ternero },
      });

      if (!ternero) {
        throw new HttpException(
          `No se encontró el ternero con ID: ${createDiarreaTerneroDto.id_ternero}`,
          HttpStatus.NOT_FOUND,
        );
      }

      // 2. Auto-calcular número de episodio para este ternero específico
      const episodiosAnteriores = await this.diarreaRepository.count({
        where: {
          ternero: { id_ternero: createDiarreaTerneroDto.id_ternero },
        },
      });

      const numeroEpisodio = episodiosAnteriores + 1;

      // 3. Generar alertas médicas para casos recurrentes
      if (numeroEpisodio > 3) {
        console.warn(
          `🚨 ALERTA MÉDICA: Ternero ID ${createDiarreaTerneroDto.id_ternero} tiene ${numeroEpisodio} episodios de diarrea. Requiere evaluación veterinaria especializada.`,
        );
      }

      if (
        createDiarreaTerneroDto.severidad === 'Severa' ||
        createDiarreaTerneroDto.severidad === 'Crítica'
      ) {
        console.warn(
          `⚠️ ATENCIÓN: Episodio de severidad ${createDiarreaTerneroDto.severidad} registrado para ternero ID ${createDiarreaTerneroDto.id_ternero}.`,
        );
      }

      // 4. Crear el registro con auto-cálculo del episodio
      const nuevaDiarreaTernero = this.diarreaRepository.create({
        fecha_diarrea_ternero: createDiarreaTerneroDto.fecha_diarrea_ternero,
        severidad: createDiarreaTerneroDto.severidad,
        numero_episodio: numeroEpisodio, // ⬅️ Auto-calculado
        observaciones: createDiarreaTerneroDto.observaciones || '',
        ternero, // Relación con el ternero
      });

      const diarreaGuardada =
        await this.diarreaRepository.save(nuevaDiarreaTernero);

      // 5. Log para seguimiento
      console.log(
        `✅ Episodio #${numeroEpisodio} de diarrea registrado para ternero ID ${createDiarreaTerneroDto.id_ternero} - Severidad: ${createDiarreaTerneroDto.severidad}`,
      );

      return diarreaGuardada;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error al registrar episodio de diarrea: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<DiarreaTerneroEntity[]> {
    try {
      const diarreasList = await this.diarreaRepository.find({
        relations: ['ternero'],
        order: {
          fecha_diarrea_ternero: 'DESC', // Más recientes primero
          numero_episodio: 'ASC',
        },
      });
      return diarreasList;
    } catch (error) {
      throw new HttpException(
        `Error al obtener todas las diarreas: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ⬅️ NUEVO: Obtener historial de un ternero específico
  async findByTerneroId(id_ternero: number): Promise<DiarreaTerneroEntity[]> {
    try {
      const historialDiarreas = await this.diarreaRepository.find({
        where: {
          ternero: { id_ternero },
        },
        relations: ['ternero'],
        order: { numero_episodio: 'ASC' },
      });

      if (historialDiarreas.length === 0) {
        throw new HttpException(
          `No se encontraron registros de diarrea para el ternero ID: ${id_ternero}`,
          HttpStatus.NOT_FOUND,
        );
      }

      return historialDiarreas;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error al buscar historial del ternero ID ${id_ternero}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ⬅️ NUEVO: Estadísticas médicas de un ternero
  async getEstadisticasTernero(id_ternero: number): Promise<{
    total_episodios: number;
    ultimo_episodio: Date;
    severidad_predominante: string;
    necesita_atencion_especial: boolean;
    dias_desde_ultimo_episodio: number;
  }> {
    try {
      const historial = await this.diarreaRepository.find({
        where: {
          ternero: { id_ternero },
        },
        order: { fecha_diarrea_ternero: 'DESC' },
      });

      if (historial.length === 0) {
        throw new HttpException(
          `No hay registros de diarrea para el ternero ID: ${id_ternero}`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Calcular severidad más frecuente
      const severidades = historial.map((d) => d.severidad);
      const severidadMasFrecuente = severidades
        .sort(
          (a, b) =>
            severidades.filter((v) => v === a).length -
            severidades.filter((v) => v === b).length,
        )
        .pop();

      // Días desde último episodio
      const ultimaFecha = historial[0].fecha_diarrea_ternero;
      const hoy = new Date();
      const diasDesdeUltimo = Math.floor(
        (hoy.getTime() - ultimaFecha.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        total_episodios: historial.length,
        ultimo_episodio: ultimaFecha,
        severidad_predominante: severidadMasFrecuente,
        necesita_atencion_especial:
          historial.length >= 3 ||
          historial.some((d) => d.requiereAtencionUrgente()),
        dias_desde_ultimo_episodio: diasDesdeUltimo,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error al calcular estadísticas del ternero ID ${id_ternero}: ${error.message}`,
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
        throw new HttpException(
          'Registro de diarrea no encontrado',
          HttpStatus.NOT_FOUND,
        );
      }

      return diarreaTernero;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error al obtener la diarrea con ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: number,
    updateDiarreaTerneroDto: UpdateDiarreaTerneroDto,
  ): Promise<DiarreaTerneroEntity> {
    try {
      const diarreaTernero = await this.diarreaRepository.findOne({
        where: { id_diarrea_ternero: id },
        relations: ['ternero'],
      });

      if (!diarreaTernero) {
        throw new HttpException(
          'Registro de diarrea no encontrado',
          HttpStatus.NOT_FOUND,
        );
      }

      // Si se cambia el ternero, buscar el nuevo
      if (
        updateDiarreaTerneroDto.id_ternero &&
        updateDiarreaTerneroDto.id_ternero !==
          diarreaTernero.ternero?.id_ternero
      ) {
        const nuevoTernero = await this.terneroRepository.findOne({
          where: { id_ternero: updateDiarreaTerneroDto.id_ternero },
        });

        if (!nuevoTernero) {
          throw new HttpException(
            `No se encontró ternero con ID: ${updateDiarreaTerneroDto.id_ternero}`,
            HttpStatus.NOT_FOUND,
          );
        }

        diarreaTernero.ternero = nuevoTernero;
      }

      // Actualizar otros campos (NOTA: numero_episodio NO se actualiza para preservar historial)
      if (updateDiarreaTerneroDto.fecha_diarrea_ternero) {
        diarreaTernero.fecha_diarrea_ternero = new Date(
          updateDiarreaTerneroDto.fecha_diarrea_ternero,
        );
      }
      if (updateDiarreaTerneroDto.severidad) {
        diarreaTernero.severidad = updateDiarreaTerneroDto.severidad;
      }
      if (updateDiarreaTerneroDto.observaciones !== undefined) {
        diarreaTernero.observaciones = updateDiarreaTerneroDto.observaciones;
      }

      return await this.diarreaRepository.save(diarreaTernero);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error al actualizar la diarrea con ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const diarrea = await this.diarreaRepository.findOne({
        where: { id_diarrea_ternero: id },
      });

      if (!diarrea) {
        throw new HttpException(
          'Registro de diarrea no encontrado',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.diarreaRepository.remove(diarrea);

      return { message: 'Registro de diarrea eliminado con éxito' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error al eliminar la diarrea con ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
