import React, { useEffect, useState } from "react";
import { useBussinesMicroservicio } from "@/hooks/bussines";

const ListadoTratamiento = () => {
  const { obtenerTratamientoHook } = useBussinesMicroservicio();
  const [tratamientos, setTratamientos] = useState([]);
  const [filtros, setFiltros] = useState({
    tipo_enfermedad: "",
    turno: "",
  });
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    por_tipo: {},
    por_turno: {},
  });

  // Opciones para filtros (actualizadas con emojis)
  const tiposEnfermedad = [
    { value: "", label: "📋 Todos los tipos" },
    { value: "diarrea", label: "🦠 Diarrea" },
    { value: "neumonia", label: "🫁 Neumonía" },
    { value: "deshidratacion", label: "💧 Deshidratación" },
  ];

  const turnosTratamiento = [
    { value: "", label: "🕐 Todos los turnos" },
    { value: "mañana", label: "🌅 Mañana" },
    { value: "tarde", label: "🌆 Tarde" },
  ];

  // Función para obtener el color del badge según el tipo de enfermedad
  const getTipoEnfermedadColor = (tipo) => {
    switch (tipo) {
      case "diarrea":
        return "bg-yellow-500 text-yellow-900";
      case "neumonia":
        return "bg-red-500 text-red-900";
      case "deshidratacion":
        return "bg-blue-500 text-blue-900";
      default:
        return "bg-gray-500 text-gray-900";
    }
  };

  // Función para obtener el emoji según el tipo
  const getTipoEnfermedadEmoji = (tipo) => {
    switch (tipo) {
      case "diarrea":
        return "🦠";
      case "neumonia":
        return "🫁";
      case "deshidratacion":
        return "💧";
      default:
        return "💊";
    }
  };

  // Función para obtener el color del badge según el turno
  const getTurnoColor = (turno) => {
    switch (turno) {
      case "mañana":
        return "bg-green-500 text-green-900";
      case "tarde":
        return "bg-orange-500 text-orange-900";
      default:
        return "bg-gray-500 text-gray-900";
    }
  };

  // Función para obtener el emoji según el turno
  const getTurnoEmoji = (turno) => {
    switch (turno) {
      case "mañana":
        return "🌅";
      case "tarde":
        return "🌆";
      default:
        return "🕐";
    }
  };

  // Función para calcular estadísticas
  const calcularEstadisticas = (listaTratamientos) => {
    const stats = {
      total: listaTratamientos.length,
      por_tipo: {},
      por_turno: {},
    };

    listaTratamientos.forEach((tratamiento) => {
      // Estadísticas por tipo
      const tipo = tratamiento.tipo_enfermedad;
      stats.por_tipo[tipo] = (stats.por_tipo[tipo] || 0) + 1;

      // Estadísticas por turno
      const turno = tratamiento.turno;
      stats.por_turno[turno] = (stats.por_turno[turno] || 0) + 1;
    });

    return stats;
  };

  // Función para cargar tratamientos con filtros
  const cargarTratamientoList = async () => {
    setLoading(true);
    try {
      // Construir query parameters
      const queryParams = new URLSearchParams();
      if (filtros.tipo_enfermedad) {
        queryParams.append("tipo_enfermedad", filtros.tipo_enfermedad);
      }
      if (filtros.turno) {
        queryParams.append("turno", filtros.turno);
      }

      const resTratamiento = await obtenerTratamientoHook(
        queryParams.toString()
      );

      const tratamientosData = resTratamiento?.data || [];
      setTratamientos(tratamientosData);

      // Calcular estadísticas
      setEstadisticas(calcularEstadisticas(tratamientosData));
    } catch (error) {
      console.error("Error al cargar tratamientos:", error);
      setTratamientos([]);
      setEstadisticas({ total: 0, por_tipo: {}, por_turno: {} });
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en los filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      tipo_enfermedad: "",
      turno: "",
    });
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    try {
      return new Date(fecha).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return fecha;
    }
  };

  useEffect(() => {
    cargarTratamientoList();
  }, [filtros]); // Se ejecuta cuando cambian los filtros

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <div className='relative flex flex-col w-full h-full overflow-scroll text-slate-300 bg-slate-800 shadow-lg rounded-xl p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-3xl font-bold text-gradient-to-r from-indigo-400 to-indigo-600'>
            💊 Listado de Tratamientos
          </h2>

          {/* Botón para crear múltiples (opcional) */}
          <div className='text-sm text-slate-400'>
            💡 Tip: Usa el formulario para crear múltiples tratamientos a la vez
          </div>
        </div>

        {/* Panel de Estadísticas */}
        {!loading && estadisticas.total > 0 && (
          <div className='mb-6 grid grid-cols-1 md:grid-cols-4 gap-4'>
            {/* Total */}
            <div className='bg-indigo-600 p-4 rounded-lg'>
              <h3 className='text-sm font-medium text-indigo-200'>
                Total Tratamientos
              </h3>
              <p className='text-2xl font-bold text-white'>
                {estadisticas.total}
              </p>
            </div>

            {/* Por tipo */}
            {Object.entries(estadisticas.por_tipo).map(([tipo, cantidad]) => (
              <div
                key={tipo}
                className={`p-4 rounded-lg ${getTipoEnfermedadColor(tipo)
                  .replace("text-", "bg-")
                  .replace("-900", "-600")}`}
              >
                <h3 className='text-sm font-medium text-white opacity-90'>
                  {getTipoEnfermedadEmoji(tipo)}{" "}
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </h3>
                <p className='text-2xl font-bold text-white'>{cantidad}</p>
              </div>
            ))}
          </div>
        )}

        {/* Panel de Filtros */}
        <div className='mb-6 p-4 bg-slate-700 rounded-lg'>
          <h3 className='text-lg font-semibold mb-3 text-indigo-300'>
            🔍 Filtros
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {/* Filtro por Tipo de Enfermedad */}
            <div>
              <label className='block text-sm font-medium mb-2'>
                Tipo de Enfermedad
              </label>
              <select
                value={filtros.tipo_enfermedad}
                onChange={(e) =>
                  handleFiltroChange("tipo_enfermedad", e.target.value)
                }
                className='w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-white focus:ring-2 focus:ring-indigo-500'
              >
                {tiposEnfermedad.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Turno */}
            <div>
              <label className='block text-sm font-medium mb-2'>Turno</label>
              <select
                value={filtros.turno}
                onChange={(e) => handleFiltroChange("turno", e.target.value)}
                className='w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-white focus:ring-2 focus:ring-indigo-500'
              >
                {turnosTratamiento.map((turno) => (
                  <option key={turno.value} value={turno.value}>
                    {turno.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón Limpiar Filtros */}
            <div className='flex items-end'>
              <button
                onClick={limpiarFiltros}
                className='w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors'
              >
                🗑️ Limpiar Filtros
              </button>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className='mt-3 text-sm text-slate-400'>
            {loading
              ? "⏳ Cargando..."
              : `📊 ${tratamientos.length} tratamiento(s) encontrado(s)`}
            {filtros.tipo_enfermedad || filtros.turno ? (
              <span className='ml-2 text-yellow-400'>
                (filtrado de {estadisticas.total} total)
              </span>
            ) : null}
          </div>
        </div>

        {/* Tabla de Tratamientos */}
        <div className='overflow-x-auto'>
          <table className='w-full text-left table-auto min-w-max bg-gradient-to-b from-gray-800 via-gray-700 to-gray-800 border-separate border-spacing-0 rounded-lg shadow-2xl'>
            <thead className='bg-slate-900'>
              <tr>
                <th className='px-4 py-2 border-b border-slate-600 bg-slate-700'>
                  <p className='text-sm font-medium leading-none'>ID</p>
                </th>
                <th className='px-4 py-2 border-b border-slate-600 bg-slate-700'>
                  <p className='text-sm font-medium leading-none'>Nombre</p>
                </th>
                <th className='px-4 py-2 border-b border-slate-600 bg-slate-700'>
                  <p className='text-sm font-medium leading-none'>
                    Descripción
                  </p>
                </th>
                <th className='px-4 py-2 border-b border-slate-600 bg-slate-700'>
                  <p className='text-sm font-medium leading-none'>
                    Tipo Enfermedad
                  </p>
                </th>
                <th className='px-4 py-2 border-b border-slate-600 bg-slate-700'>
                  <p className='text-sm font-medium leading-none'>Turno</p>
                </th>
                <th className='px-4 py-2 border-b border-slate-600 bg-slate-700'>
                  <p className='text-sm font-medium leading-none'>Fecha</p>
                </th>
                <th className='px-4 py-2 border-b border-slate-600 bg-slate-700'>
                  <p className='text-sm font-medium leading-none'>
                    Aplicaciones
                  </p>
                </th>
              </tr>
            </thead>
            <tbody className='text-slate-300'>
              {loading ? (
                <tr>
                  <td colSpan='7' className='px-4 py-8 text-center'>
                    <div className='flex justify-center items-center'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500'></div>
                      <span className='ml-2'>Cargando tratamientos...</span>
                    </div>
                  </td>
                </tr>
              ) : tratamientos.length === 0 ? (
                <tr>
                  <td
                    colSpan='7'
                    className='px-4 py-8 text-center text-slate-400'
                  >
                    <div className='space-y-2'>
                      <div>
                        📭 No se encontraron tratamientos con los filtros
                        aplicados
                      </div>
                      {(filtros.tipo_enfermedad || filtros.turno) && (
                        <button
                          onClick={limpiarFiltros}
                          className='text-indigo-400 hover:text-indigo-300 underline text-sm'
                        >
                          Limpiar filtros para ver todos
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                tratamientos.map((tratamiento, index) => (
                  <tr
                    key={tratamiento.id_tratamiento}
                    className='hover:bg-slate-600 transition-all duration-300'
                  >
                    <td className='px-4 py-2 border-b border-slate-700'>
                      <p className='text-sm font-semibold'>
                        #{tratamiento.id_tratamiento}
                      </p>
                    </td>
                    <td className='px-4 py-2 border-b border-slate-700'>
                      <div>
                        <p className='text-sm font-medium text-indigo-300'>
                          {tratamiento.nombre}
                        </p>
                        {index < 3 && (
                          <span className='text-xs text-green-400'>
                            ✨ Reciente
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='px-4 py-2 border-b border-slate-700'>
                      <p
                        className='text-sm text-slate-300 max-w-xs truncate'
                        title={tratamiento.descripcion}
                      >
                        {tratamiento.descripcion}
                      </p>
                    </td>
                    <td className='px-4 py-2 border-b border-slate-700'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoEnfermedadColor(
                          tratamiento.tipo_enfermedad
                        )}`}
                      >
                        {getTipoEnfermedadEmoji(tratamiento.tipo_enfermedad)}{" "}
                        {tratamiento.tipo_enfermedad?.charAt(0).toUpperCase() +
                          tratamiento.tipo_enfermedad?.slice(1)}
                      </span>
                    </td>
                    <td className='px-4 py-2 border-b border-slate-700'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTurnoColor(
                          tratamiento.turno
                        )}`}
                      >
                        {getTurnoEmoji(tratamiento.turno)}{" "}
                        {tratamiento.turno?.charAt(0).toUpperCase() +
                          tratamiento.turno?.slice(1)}
                      </span>
                    </td>
                    <td className='px-4 py-2 border-b border-slate-700'>
                      <p className='text-sm'>
                        📅 {formatearFecha(tratamiento.fecha_tratamiento)}
                      </p>
                    </td>
                    <td className='px-4 py-2 border-b border-slate-700'>
                      {tratamiento?.ternerosTratamientos?.length > 0 ? (
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2 mb-1'>
                            <span className='text-xs text-green-400'>
                              ✅ {tratamiento.ternerosTratamientos.length}{" "}
                              aplicación(es)
                            </span>
                          </div>
                          {tratamiento.ternerosTratamientos
                            .slice(0, 2)
                            .map((terneroTratamiento) => (
                              <div
                                key={terneroTratamiento.id_ternero_tratamiento}
                                className='text-xs bg-slate-600 px-2 py-1 rounded'
                              >
                                📋{" "}
                                {formatearFecha(
                                  terneroTratamiento.fecha_aplicacion
                                )}
                              </div>
                            ))}
                          {tratamiento.ternerosTratamientos.length > 2 && (
                            <div className='text-xs text-slate-400'>
                              +{tratamiento.ternerosTratamientos.length - 2}{" "}
                              más...
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className='text-xs text-slate-500 italic'>
                          ⏳ Sin aplicaciones
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Información adicional */}
        {!loading && tratamientos.length > 0 && (
          <div className='mt-4 p-4 bg-slate-700 rounded-lg'>
            <h3 className='text-sm font-bold text-slate-300 mb-2'>
              📋 Información:
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400'>
              <div>
                <p className='mb-1'>
                  <strong>💊 Tratamientos:</strong> Gestión completa de
                  medicamentos y terapias
                </p>
                <p>
                  <strong>🔍 Filtros:</strong> Filtra por tipo de enfermedad y
                  turno de aplicación
                </p>
              </div>
              <div>
                <p className='mb-1'>
                  <strong>📊 Estadísticas:</strong> Resumen visual por
                  categorías
                </p>
                <p>
                  <strong>✨ Recientes:</strong> Los primeros 3 tratamientos
                  están marcados como recientes
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListadoTratamiento;
