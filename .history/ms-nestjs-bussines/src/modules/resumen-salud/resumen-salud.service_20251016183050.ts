// src/modules/resumen-salud/resumen-salud.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TerneroEntity } from '../terneros/entities/ternero.entity';
import { TratamientoEntity } from '../tratamientos/entities/tratamiento.entity';
import { DiarreaTerneroEntity } from '../diarrea-terneros/entities/diarrea-ternero.entity';

export interface ResumenSaludDto {
  // Datos generales
  totalTerneros: number;
  ternerosMuertos: number;
  ternerosVivos: number;

  // Métricas principales
  porcentajeMortalidad: number;
  porcentajeMorbilidad: number;

  // Tratamientos
  ternerosConTratamientos: number;
  tratamientosTotal: number;
  desgloseTratamientos: { tipo_enfermedad: string; cantidad: number }[];

  // Diarreas
  ternerosConDiarreas: number;
  episodiosDiarrea: number;
  desgloseDiarreas: {
    moderada: number;
    critica: number;
    severa: number;
  };

  // Análisis cruzado
  ternerosConAmbosProblemas: number; // Tratamientos + Diarreas
  ternerosConSoloTratamientos: number; // Solo tratamientos
  ternerosConSoloDiarreas: number; // Solo diarreas
  ternerosCompletamenteSanos: number; // Sin problemas
  porcentajeTernerosEnfermos: number;
}

@Injectable()
export class ResumenSaludService {
  constructor(
    @InjectRepository(TerneroEntity)
    private readonly terneroRepository: Repository<TerneroEntity>,
    @InjectRepository(TratamientoEntity)
    private readonly tratamientoRepository: Repository<TratamientoEntity>,
    @InjectRepository(DiarreaTerneroEntity)
    private readonly diarreaRepository: Repository<DiarreaTerneroEntity>,
  ) {}

  // ✅ MÉTODO ACTUALIZADO con multi-tenancy
  // ✅ MÉTODO ACTUALIZADO con multi-tenancy
  async obtenerResumenSalud(
    idEstablecimiento: number | null,
    esAdmin: boolean,
    idEstablecimientoQuery?: number | null, // ⬅️ NUEVO PARÁMETRO
  ): Promise<ResumenSaludDto> {
    console.log('🐄 Iniciando cálculo de resumen de salud...', {
      establecimiento: idEstablecimiento,
      esAdmin,
      queryParam: idEstablecimientoQuery,
    });

    try {
      // Determinar el ID de establecimiento a usar para el filtrado
      let idEstablecimientoFiltro: number | null = null;

      if (esAdmin) {
        // Si es admin Y tiene query param, usar ese
        idEstablecimientoFiltro = idEstablecimientoQuery;
        console.log(
          idEstablecimientoQuery
            ? `✅ Admin filtrando por establecimiento: ${idEstablecimientoQuery}`
            : '✅ Admin viendo TODOS los establecimientos',
        );
      } else {
        // Si NO es admin, usar su establecimiento
        idEstablecimientoFiltro = idEstablecimiento;
        console.log(
          `✅ Usuario no-admin, filtrando por su establecimiento: ${idEstablecimiento}`,
        );
      }

      // 1. Datos básicos de terneros (filtrados por establecimiento)
      const queryTerneros =
        this.terneroRepository.createQueryBuilder('ternero');

      if (idEstablecimientoFiltro) {
        queryTerneros.where('ternero.id_establecimiento = :idEstablecimiento', {
          idEstablecimiento: idEstablecimientoFiltro,
        });
      }

      const totalTerneros = await queryTerneros.getCount();

      const queryMuertos = this.terneroRepository
        .createQueryBuilder('ternero')
        .where('ternero.estado = :estado', { estado: 'Muerto' });

      if (idEstablecimientoFiltro) {
        queryMuertos.andWhere(
          'ternero.id_establecimiento = :idEstablecimiento',
          {
            idEstablecimiento: idEstablecimientoFiltro,
          },
        );
      }

      const ternerosMuertos = await queryMuertos.getCount();
      const ternerosVivos = totalTerneros - ternerosMuertos;

      console.log(
        `📊 Terneros: Total=${totalTerneros}, Vivos=${ternerosVivos}, Muertos=${ternerosMuertos}`,
      );

      // 2. Tratamientos: terneros únicos con tratamientos
      const queryTratamientos = this.tratamientoRepository
        .createQueryBuilder('tratamiento')
        .select('DISTINCT tratamiento.ternero.id_ternero', 'id_ternero')
        .where('tratamiento.ternero IS NOT NULL');

      if (idEstablecimientoFiltro) {
        queryTratamientos.andWhere(
          'tratamiento.id_establecimiento = :idEstablecimiento',
          { idEstablecimiento: idEstablecimientoFiltro },
        );
      }

      const ternerosConTratamientosQuery = await queryTratamientos.getRawMany();
      const ternerosConTratamientos = ternerosConTratamientosQuery.length;

      const queryTratamientosTotal = this.tratamientoRepository
        .createQueryBuilder('tratamiento')
        .where('tratamiento.ternero IS NOT NULL');

      if (idEstablecimientoFiltro) {
        queryTratamientosTotal.andWhere(
          'tratamiento.id_establecimiento = :idEstablecimiento',
          { idEstablecimiento: idEstablecimientoFiltro },
        );
      }

      const tratamientosTotal = await queryTratamientosTotal.getCount();

      console.log(
        `💊 Tratamientos: ${ternerosConTratamientos} terneros únicos, ${tratamientosTotal} tratamientos total`,
      );

      // 3. Desglose de tratamientos por tipo
      const queryDesgloseTratamientos = this.tratamientoRepository
        .createQueryBuilder('tratamiento')
        .select([
          'tratamiento.tipo_enfermedad as tipo_enfermedad',
          'COUNT(*) as cantidad',
        ])
        .where('tratamiento.ternero IS NOT NULL')
        .andWhere('tratamiento.tipo_enfermedad IS NOT NULL');

      if (idEstablecimientoFiltro) {
        queryDesgloseTratamientos.andWhere(
          'tratamiento.id_establecimiento = :idEstablecimiento',
          { idEstablecimiento: idEstablecimientoFiltro },
        );
      }

      const desgloseTratamientos = await queryDesgloseTratamientos
        .groupBy('tratamiento.tipo_enfermedad')
        .orderBy('cantidad', 'DESC')
        .getRawMany();

      // 4. Diarreas: terneros únicos con diarreas
      const queryDiarreas = this.diarreaRepository
        .createQueryBuilder('diarrea')
        .select('DISTINCT diarrea.ternero.id_ternero', 'id_ternero');

      if (idEstablecimientoFiltro) {
        queryDiarreas.where('diarrea.id_establecimiento = :idEstablecimiento', {
          idEstablecimiento: idEstablecimientoFiltro,
        });
      }

      const ternerosConDiarreasQuery = await queryDiarreas.getRawMany();
      const ternerosConDiarreas = ternerosConDiarreasQuery.length;

      const queryEpisodiosDiarrea =
        this.diarreaRepository.createQueryBuilder('diarrea');

      if (idEstablecimientoFiltro) {
        queryEpisodiosDiarrea.where(
          'diarrea.id_establecimiento = :idEstablecimiento',
          {
            idEstablecimiento: idEstablecimientoFiltro,
          },
        );
      }

      const episodiosDiarrea = await queryEpisodiosDiarrea.getCount();

      console.log(
        `🤧 Diarreas: ${ternerosConDiarreas} terneros únicos, ${episodiosDiarrea} episodios total`,
      );

      // 5. Desglose de diarreas por severidad
      const queryDiarreasSeveridad = this.diarreaRepository
        .createQueryBuilder('diarrea')
        .select(['diarrea.severidad as severidad', 'COUNT(*) as cantidad']);

      if (idEstablecimientoFiltro) {
        queryDiarreasSeveridad.where(
          'diarrea.id_establecimiento = :idEstablecimiento',
          { idEstablecimiento: idEstablecimientoFiltro },
        );
      }

      const diarreasPorSeveridad = await queryDiarreasSeveridad
        .groupBy('diarrea.severidad')
        .getRawMany();

      // Procesar severidades con valores por defecto
      const desgloseDiarreas = {
        moderada: 0,
        critica: 0,
        severa: 0,
      };

      diarreasPorSeveridad.forEach((item) => {
        const severidad = item.severidad?.toLowerCase();
        const cantidad = parseInt(item.cantidad);

        if (severidad === 'moderada') desgloseDiarreas.moderada = cantidad;
        else if (severidad === 'crítica' || severidad === 'critica')
          desgloseDiarreas.critica = cantidad;
        else if (severidad === 'severa') desgloseDiarreas.severa = cantidad;
      });

      // 6. ANÁLISIS CRUZADO
      const idsConTratamientos = ternerosConTratamientosQuery.map(
        (t) => t.id_ternero,
      );
      const idsConDiarreas = ternerosConDiarreasQuery.map((d) => d.id_ternero);

      console.log('🔍 Análisis de IDs:', {
        idsConTratamientos,
        idsConDiarreas,
      });

      // Intersección: terneros que tienen TANTO tratamientos como diarreas
      const idsConAmbosProblemas = idsConTratamientos.filter((id) =>
        idsConDiarreas.includes(id),
      );
      const ternerosConAmbosProblemas = idsConAmbosProblemas.length;

      // Solo tratamientos: tratamientos pero NO diarreas
      const idsConSoloTratamientos = idsConTratamientos.filter(
        (id) => !idsConDiarreas.includes(id),
      );
      const ternerosConSoloTratamientos = idsConSoloTratamientos.length;

      // Solo diarreas: diarreas pero NO tratamientos
      const idsConSoloDiarreas = idsConDiarreas.filter(
        (id) => !idsConTratamientos.includes(id),
      );
      const ternerosConSoloDiarreas = idsConSoloDiarreas.length;

      // Unión: terneros únicos con al menos un problema
      const ternerosUnicosEnfermos = new Set([
        ...idsConTratamientos,
        ...idsConDiarreas,
      ]).size;

      // Terneros completamente sanos
      const ternerosCompletamenteSanos = totalTerneros - ternerosUnicosEnfermos;

      // VERIFICACIÓN DE CONSISTENCIA
      const verificacion =
        ternerosConAmbosProblemas +
        ternerosConSoloTratamientos +
        ternerosConSoloDiarreas +
        ternerosCompletamenteSanos;

      console.log('🧮 Verificación del análisis cruzado:', {
        ambosProblemas: ternerosConAmbosProblemas,
        soloTratamientos: ternerosConSoloTratamientos,
        soloDiarreas: ternerosConSoloDiarreas,
        completamenteSanos: ternerosCompletamenteSanos,
        suma: verificacion,
        totalTerneros,
        esConsistente: verificacion === totalTerneros,
      });

      // 7. Cálculo de métricas
      const porcentajeMortalidad =
        totalTerneros > 0
          ? Number(((ternerosMuertos / totalTerneros) * 100).toFixed(2))
          : 0;

      const porcentajeMorbilidad =
        totalTerneros > 0
          ? Number(((ternerosUnicosEnfermos / totalTerneros) * 100).toFixed(2))
          : 0;

      const porcentajeTernerosEnfermos = porcentajeMorbilidad;

      console.log('📈 Métricas calculadas:', {
        mortalidad: `${porcentajeMortalidad}%`,
        morbilidad: `${porcentajeMorbilidad}%`,
        ambos_problemas: ternerosConAmbosProblemas,
        completamente_sanos: ternerosCompletamenteSanos,
      });

      // 8. Preparar respuesta
      const resumen: ResumenSaludDto = {
        // Datos generales
        totalTerneros,
        ternerosMuertos,
        ternerosVivos,

        // Métricas principales
        porcentajeMortalidad,
        porcentajeMorbilidad,

        // Tratamientos
        ternerosConTratamientos,
        tratamientosTotal,
        desgloseTratamientos: desgloseTratamientos.map((item) => ({
          tipo_enfermedad: item.tipo_enfermedad,
          cantidad: parseInt(item.cantidad),
        })),

        // Diarreas
        ternerosConDiarreas,
        episodiosDiarrea,
        desgloseDiarreas,

        // Análisis cruzado
        ternerosConAmbosProblemas,
        ternerosConSoloTratamientos,
        ternerosConSoloDiarreas,
        ternerosCompletamenteSanos,
        porcentajeTernerosEnfermos,
      };

      console.log('✅ Resumen de salud calculado exitosamente');
      return resumen;
    } catch (error) {
      console.error('❌ Error calculando resumen de salud:', error);
      throw new Error(`Error al calcular resumen de salud: ${error.message}`);
    }
  }
}
