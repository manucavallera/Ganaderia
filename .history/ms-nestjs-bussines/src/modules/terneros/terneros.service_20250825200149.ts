import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateTerneroDto,
  AddPesoDiarioDto,
  HistorialPesosResponseDto,
} from './dto/create-ternero.dto';
import { UpdateTerneroDto } from './dto/update-ternero.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TerneroEntity } from './entities/ternero.entity';
import { Repository } from 'typeorm';
import { MadreEntity } from '../madres/entities/madre.entity';

@Injectable()
export class TernerosService {
  constructor(
    @InjectRepository(TerneroEntity)
    private readonly terneroRepository: Repository<TerneroEntity>,
    @InjectRepository(MadreEntity)
    private readonly madreRepository: Repository<MadreEntity>,
  ) {}

  async create(createTerneroDto: CreateTerneroDto): Promise<TerneroEntity> {
    try {
      // Buscar la madre en la base de datos
      const madre = await this.madreRepository.findOne({
        where: { id_madre: createTerneroDto.id_madre },
      });

      if (!madre) {
        throw new HttpException(
          `No se encontró la madre con ID ${createTerneroDto.id_madre}`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Crear el ternero y asignar la madre
      const nuevoTernero = this.terneroRepository.create({
        ...createTerneroDto,
        // Convertir string de fecha a Date
        fecha_nacimiento: new Date(createTerneroDto.fecha_nacimiento),
        madre, // Asigna la relación con la madre
      });

      const terneroGuardado = await this.terneroRepository.save(nuevoTernero);

      // Calcular todos los indicadores de crecimiento
      try {
        terneroGuardado.calcularIndicadoresCrecimiento();
      } catch (error) {
        console.error('Error calculando indicadores en create:', error);
        terneroGuardado.dias_desde_nacimiento = 0;
      }

      return terneroGuardado;
    } catch (error) {
      throw new HttpException(
        `Error al crear el ternero: ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async findAll(): Promise<TerneroEntity[]> {
    try {
      console.log('Iniciando findAll de terneros...');

      const terneroList = await this.terneroRepository.find({
        relations: ['madre', 'eventos'],
      });

      console.log(`Encontrados ${terneroList.length} terneros`);

      // Calcular indicadores de crecimiento para cada ternero CON MANEJO DE ERRORES
      return terneroList.map((ternero, index) => {
        try {
          console.log(
            `Procesando ternero ${index + 1} - ID: ${ternero.id_ternero}, Fecha: ${ternero.fecha_nacimiento}`,
          );
          ternero.calcularIndicadoresCrecimiento();
          console.log(`Días calculados: ${ternero.dias_desde_nacimiento}`);
          console.log(`Último peso: ${ternero.ultimo_peso}`);
          console.log(
            `Aumento diario promedio: ${ternero.aumento_diario_promedio} kg/día`,
          );
        } catch (error) {
          console.error(
            `Error calculando indicadores para ternero ID ${ternero.id_ternero}:`,
            error,
          );
          ternero.dias_desde_nacimiento = 0;
          ternero.ultimo_peso = ternero.peso_nacer;
          ternero.aumento_diario_promedio = 0;
        }
        return ternero;
      });
    } catch (error) {
      console.error('Error completo en findAll:', error);
      throw new HttpException(
        `Error al obtener los terneros: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<TerneroEntity> {
    try {
      const ternero = await this.terneroRepository.findOne({
        where: { id_ternero: id },
        relations: ['madre', 'eventos'],
      });

      if (!ternero) {
        throw new HttpException('Ternero no encontrado', HttpStatus.NOT_FOUND);
      }

      // Calcular todos los indicadores de crecimiento
      try {
        ternero.calcularIndicadoresCrecimiento();
      } catch (error) {
        console.error('Error calculando indicadores en findOne:', error);
        ternero.dias_desde_nacimiento = 0;
        ternero.ultimo_peso = ternero.peso_nacer;
        ternero.aumento_diario_promedio = 0;
      }

      return ternero;
    } catch (error) {
      throw new HttpException(
        `Error al obtener el ternero con el ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: number,
    updateTerneroDto: UpdateTerneroDto,
  ): Promise<TerneroEntity> {
    try {
      // Buscar el ternero por ID
      const ternero = await this.terneroRepository.findOne({
        where: { id_ternero: id },
        relations: ['madre'],
      });

      if (!ternero) {
        throw new HttpException('Ternero no encontrado', HttpStatus.NOT_FOUND);
      }

      // Si el DTO contiene un nuevo id_madre, buscamos la madre
      if (updateTerneroDto.id_madre) {
        const nuevaMadre = await this.madreRepository.findOne({
          where: { id_madre: updateTerneroDto.id_madre },
        });

        if (!nuevaMadre) {
          throw new HttpException(
            'La nueva madre no existe',
            HttpStatus.NOT_FOUND,
          );
        }

        ternero.madre = nuevaMadre; // Asignamos la nueva madre
      }

      // Manejar conversión de fecha si está presente
      if (updateTerneroDto.fecha_nacimiento) {
        ternero.fecha_nacimiento = new Date(updateTerneroDto.fecha_nacimiento);
      }

      // Actualizamos otros campos del ternero (excluyendo la fecha ya manejada)
      const { fecha_nacimiento, id_madre, ...otrosCampos } = updateTerneroDto;
      Object.assign(ternero, otrosCampos);

      const terneroActualizado = await this.terneroRepository.save(ternero);

      // Calcular todos los indicadores de crecimiento
      try {
        terneroActualizado.calcularIndicadoresCrecimiento();
      } catch (error) {
        console.error('Error calculando indicadores en update:', error);
        terneroActualizado.dias_desde_nacimiento = 0;
        terneroActualizado.ultimo_peso = terneroActualizado.peso_nacer;
        terneroActualizado.aumento_diario_promedio = 0;
      }

      return terneroActualizado;
    } catch (error) {
      throw new HttpException(
        `Error al actualizar el ternero con ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      // Buscar el ternero por ID
      const ternero = await this.terneroRepository.findOne({
        where: {
          id_ternero: id,
        },
      });

      // Si no se encuentra el ternero, lanzamos una excepción con un error 404
      if (!ternero) {
        throw new HttpException('Ternero no encontrado', HttpStatus.NOT_FOUND);
      }

      // Eliminar el ternero
      await this.terneroRepository.remove(ternero);

      return { message: 'Ternero eliminado con éxito' };
    } catch (error) {
      throw new HttpException(
        `Error al eliminar el ternero con ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // NUEVO MÉTODO: Agregar peso diario usando el DTO
  async agregarPesoDiario(
    id: number,
    addPesoDiarioDto: AddPesoDiarioDto,
  ): Promise<TerneroEntity> {
    try {
      const ternero = await this.terneroRepository.findOne({
        where: { id_ternero: id },
        relations: ['madre'],
      });

      if (!ternero) {
        throw new HttpException('Ternero no encontrado', HttpStatus.NOT_FOUND);
      }

      // Usar fecha proporcionada o fecha actual
      const fecha = addPesoDiarioDto.fecha
        ? new Date(addPesoDiarioDto.fecha).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
          })
        : new Date().toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
          });

      // Agregar el nuevo pesaje usando el método de la entidad
      ternero.agregarPesaje(fecha, addPesoDiarioDto.peso_actual);

      // Guardar en la base de datos
      const terneroActualizado = await this.terneroRepository.save(ternero);

      // Recalcular indicadores
      terneroActualizado.calcularIndicadoresCrecimiento();

      console.log(
        `Peso diario agregado: ${fecha} - ${addPesoDiarioDto.peso_actual}kg para ternero ID ${id}`,
      );

      return terneroActualizado;
    } catch (error) {
      throw new HttpException(
        `Error al agregar peso diario al ternero con ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // NUEVO MÉTODO: Obtener historial completo de pesos con estadísticas
  async obtenerHistorialCompleto(
    id: number,
  ): Promise<HistorialPesosResponseDto> {
    try {
      const ternero = await this.terneroRepository.findOne({
        where: { id_ternero: id },
        relations: ['madre'],
      });

      if (!ternero) {
        throw new HttpException('Ternero no encontrado', HttpStatus.NOT_FOUND);
      }

      // Calcular todos los indicadores
      ternero.calcularIndicadoresCrecimiento();

      // Obtener historial de pesajes
      const historialPesos = ternero.obtenerHistorialPesajes();
      const ultimoPeso = ternero.obtenerUltimoPeso();

      // Calcular ganancia total
      const gananciaTotal = ultimoPeso.peso - ternero.peso_nacer;

      const response: HistorialPesosResponseDto = {
        id_ternero: ternero.id_ternero,
        rp_ternero: ternero.rp_ternero,
        peso_nacer: ternero.peso_nacer,
        ultimo_peso: ultimoPeso.peso,
        ultimo_pesaje_fecha: ultimoPeso.fecha,
        historial_pesos: historialPesos,
        ganancia_total: parseFloat(gananciaTotal.toFixed(2)),
        aumento_diario_promedio: ternero.aumento_diario_promedio,
        dias_desde_nacimiento: ternero.dias_desde_nacimiento,
      };

      return response;
    } catch (error) {
      throw new HttpException(
        `Error al obtener historial completo del ternero con ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // MÉTODO EXISTENTE: Agregar pesaje (mantenido para compatibilidad)
  async agregarPesaje(
    id: number,
    fecha: string,
    peso: number,
    observaciones?: string,
  ): Promise<TerneroEntity> {
    try {
      const ternero = await this.terneroRepository.findOne({
        where: { id_ternero: id },
        relations: ['madre'],
      });

      if (!ternero) {
        throw new HttpException('Ternero no encontrado', HttpStatus.NOT_FOUND);
      }

      // Agregar el nuevo pesaje
      ternero.agregarPesaje(fecha, peso);

      // Guardar en la base de datos
      const terneroActualizado = await this.terneroRepository.save(ternero);

      // Recalcular indicadores
      terneroActualizado.calcularIndicadoresCrecimiento();

      console.log(
        `Pesaje agregado: ${fecha} - ${peso}kg para ternero ID ${id}`,
      );

      return terneroActualizado;
    } catch (error) {
      throw new HttpException(
        `Error al agregar pesaje al ternero con ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // MÉTODO EXISTENTE: Obtener historial de pesajes (mantenido para compatibilidad)
  async obtenerHistorialPesajes(
    id: number,
  ): Promise<Array<{ fecha: string; peso: number }>> {
    try {
      const ternero = await this.terneroRepository.findOne({
        where: { id_ternero: id },
      });

      if (!ternero) {
        throw new HttpException('Ternero no encontrado', HttpStatus.NOT_FOUND);
      }

      return ternero.obtenerHistorialPesajes();
    } catch (error) {
      throw new HttpException(
        `Error al obtener historial de pesajes del ternero con ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
