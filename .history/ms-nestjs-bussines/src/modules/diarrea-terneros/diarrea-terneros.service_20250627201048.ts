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
      // 1. Buscar el ternero por RP (en lugar de ID)
      const ternero = await this.terneroRepository.findOne({
        where: { rp_ternero: createDiarreaTerneroDto.rp_ternero },
      });

      if (!ternero) {
        throw new HttpException(
          `No se encontró el ternero con RP: ${createDiarreaTerneroDto.rp_ternero}`,
          HttpStatus.NOT_FOUND,
        );
      }

      // 2. Auto-calcular número de episodio para este ternero
      const episodiosAnteriores = await this.diarreaRepository.count({
        where: { rp_ternero: createDiarreaTerneroDto.rp_ternero },
      });

      const numeroEpisodio = episodiosAnteriores + 1;

      // 3. Verificar si es un episodio recurrente (alertas médicas)
      if (numeroEpisodio > 3) {
        console.warn(
          `🚨 ALERTA: Ternero ${createDiarreaTerneroDto.rp_ternero} tiene ${numeroEpisodio} episodios de diarrea. Requiere atención veterinaria especializada.`,
        );
      }

      // 4. Crear la diarrea con datos completos
      const nuevaDiarreaTernero = this.diarreaRepository.create({
        fecha_diarrea_ternero: new Date(
          createDiarreaTerneroDto.fecha_diarrea_ternero,
        ),
        severidad: createDiarreaTerneroDto.severidad,
        rp_ternero: createDiarreaTerneroDto.rp_ternero,
        numero_episodio: numeroEpisodio, // ⬅️ Auto-calculado
        observaciones: createDiarreaTerneroDto.observaciones || '',
        ternero, // Relación para integridad referencial
      });

      const diarreaGuardada =
        await this.diarreaRepository.save(nuevaDiarreaTernero);

      // 5. Log para seguimiento médico
      console.log(
        `✅ Episodio #${numeroEpisodio} de diarrea registrado para ternero ${createDiarreaTerneroDto.rp_ternero} - Severidad: ${createDiarreaTerneroDto.severidad}`,
      );

      return diarreaGuardada;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error al crear registro de diarrea: ${error.message}`,
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
          numero_episodio: 'ASC', // Por episodio si es la misma fecha
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

  // ⬅️ NUEVO: Buscar por RP del ternero
  async findByTerneroRP(rp_ternero: string): Promise<DiarreaTerneroEntity[]> {
    try {
      const diarreas = await this.diarreaRepository.find({
        where: { rp_ternero },
        relations: ['ternero'],
        order: { numero_episodio: 'ASC' },
      });

      if (diarreas.length === 0) {
        throw new HttpException(
          `No se encontraron registros de diarrea para el ternero con RP: ${rp_ternero}`,
          HttpStatus.NOT_FOUND,
        );
      }

      return diarreas;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error al buscar diarreas por RP: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ⬅️ NUEVO: Obtener estadísticas de un ternero
  async getEstadisticasTernero(rp_ternero: string): Promise<{
    total_episodios: number;
    ultimo_episodio: Date;
    severidad_predominante: string;
    requiere_atencion: boolean;
  }> {
    try {
      const diarreas = await this.diarreaRepository.find({
        where: { rp_ternero },
        order: { fecha_diarrea_ternero: 'DESC' },
      });

      if (diarreas.length === 0) {
        throw new HttpException(
          `No hay registros para el ternero ${rp_ternero}`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Calcular severidad predominante
      const severidades = diarreas.map((d) => d.severidad);
      const severidadMasFrecuente = severidades
        .sort(
          (a, b) =>
            severidades.filter((v) => v === a).length -
            severidades.filter((v) => v === b).length,
        )
        .pop();

      return {
        total_episodios: diarreas.length,
        ultimo_episodio: diarreas[0].fecha_diarrea_ternero,
        severidad_predominante: severidadMasFrecuente,
        requiere_atencion:
          diarreas.length >= 3 ||
          diarreas.some((d) => d.requiereAtencionUrgente()),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error al obtener estadísticas: ${error.message}`,
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

      // Si se cambia el RP del ternero, buscar el nuevo ternero
      if (
        updateDiarreaTerneroDto.rp_ternero &&
        updateDiarreaTerneroDto.rp_ternero !== diarreaTernero.rp_ternero
      ) {
        const nuevoTernero = await this.terneroRepository.findOne({
          where: { rp_ternero: updateDiarreaTerneroDto.rp_ternero },
        });

        if (!nuevoTernero) {
          throw new HttpException(
            `No se encontró ternero con RP: ${updateDiarreaTerneroDto.rp_ternero}`,
            HttpStatus.NOT_FOUND,
          );
        }

        diarreaTernero.ternero = nuevoTernero;
        diarreaTernero.rp_ternero = updateDiarreaTerneroDto.rp_ternero;
      }

      // Actualizar otros campos
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
      // Nota: numero_episodio NO se actualiza para mantener la integridad del historial

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
