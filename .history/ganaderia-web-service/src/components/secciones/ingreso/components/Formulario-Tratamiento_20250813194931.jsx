import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useBussinesMicroservicio } from "@/hooks/bussines";

const FormularioTratamiento = ({ setStep }) => {
  const { crearTratamientoHook, crearMultiplesTratamientosHook } =
    useBussinesMicroservicio();

  const [tratamientoAlert, setTratamientoAlert] = useState({
    status: false,
    message: "",
    estado: true,
  });

  // 🆕 NUEVO: Estado para modo múltiple
  const [modoMultiple, setModoMultiple] = useState(false);
  const [tratamientos, setTratamientos] = useState([
    {
      nombre: "",
      descripcion: "",
      tipo_enfermedad: "",
      turno: "",
      fecha_tratamiento: new Date().toISOString().split("T")[0],
    },
  ]);
  const [loadingMultiple, setLoadingMultiple] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Opciones para tipo de enfermedad
  const tiposEnfermedad = [
    { value: "diarrea", label: "🦠 Diarrea" },
    { value: "neumonia", label: "🫁 Neumonía" },
    { value: "deshidratacion", label: "💧 Deshidratación" },
  ];

  // Opciones para turno
  const turnosTratamiento = [
    { value: "mañana", label: "🌅 Mañana" },
    { value: "tarde", label: "🌆 Tarde" },
  ];

  // Función para mostrar alertas
  const showAlert = (message, estado = true) => {
    setTratamientoAlert({
      status: true,
      message: message,
      estado: estado,
    });

    setTimeout(() => {
      setTratamientoAlert({
        status: false,
        message: "",
        estado: true,
      });
    }, 5000);
  };

  // Envío individual (original)
  const onSubmit = async (data) => {
    let newTratamiento = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      tipo_enfermedad: data.tipo_enfermedad,
      turno: data.turno,
      fecha_tratamiento: data.fecha_tratamiento,
    };

    console.log("Datos a enviar:", newTratamiento);

    const resCrearTratamiento = await crearTratamientoHook(newTratamiento);
    if (resCrearTratamiento?.status == 201) {
      showAlert("✅ SE HA REGISTRADO CORRECTAMENTE EL TRATAMIENTO", true);
      reset();
    } else {
      showAlert("❌ ERROR 401, SESSION CADUCADA", false);
      reset();
    }
  };

  // 🆕 NUEVO: Funciones para modo múltiple
  const agregarTratamiento = () => {
    setTratamientos([
      ...tratamientos,
      {
        nombre: "",
        descripcion: "",
        tipo_enfermedad: "",
        turno: "",
        fecha_tratamiento: new Date().toISOString().split("T")[0],
      },
    ]);
  };

  const eliminarTratamiento = (index) => {
    if (tratamientos.length > 1) {
      const nuevos = tratamientos.filter((_, i) => i !== index);
      setTratamientos(nuevos);
    }
  };

  const actualizarTratamiento = (index, campo, valor) => {
    const nuevos = tratamientos.map((tratamiento, i) =>
      i === index ? { ...tratamiento, [campo]: valor } : tratamiento
    );
    setTratamientos(nuevos);
  };

  const duplicarTratamiento = (index) => {
    const tratamientoDuplicado = { ...tratamientos[index] };
    tratamientoDuplicado.nombre = `${tratamientoDuplicado.nombre} (Copia)`;

    const nuevos = [...tratamientos];
    nuevos.splice(index + 1, 0, tratamientoDuplicado);
    setTratamientos(nuevos);
  };

  // Validar tratamientos múltiples
  const validarTratamientosMultiples = () => {
    return tratamientos.every(
      (tratamiento) =>
        tratamiento.nombre.trim() &&
        tratamiento.descripcion.trim() &&
        tratamiento.tipo_enfermedad &&
        tratamiento.turno &&
        tratamiento.fecha_tratamiento
    );
  };

  // Envío múltiple
  const onSubmitMultiple = async () => {
    if (!validarTratamientosMultiples()) {
      showAlert(
        "❌ Por favor completa todos los campos de todos los tratamientos",
        false
      );
      return;
    }

    setLoadingMultiple(true);

    try {
      console.log("📤 Enviando múltiples tratamientos:", { tratamientos });

      const resultado = await crearMultiplesTratamientosHook({ tratamientos });

      if (resultado?.status === 201 || resultado?.status === 200) {
        const data = resultado.data;

        if (data.errores && data.errores.length > 0) {
          showAlert(
            `✅ Se crearon ${data.total_creados} de ${tratamientos.length} tratamientos. ${data.errores.length} fallaron.`,
            true
          );
        } else {
          showAlert(
            `✅ Se crearon ${data.total_creados} tratamientos exitosamente`,
            true
          );

          // Limpiar formulario después del éxito total
          setTratamientos([
            {
              nombre: "",
              descripcion: "",
              tipo_enfermedad: "",
              turno: "",
              fecha_tratamiento: new Date().toISOString().split("T")[0],
            },
          ]);
        }
      } else if (resultado?.status === 401) {
        showAlert("❌ Sesión expirada. Inicia sesión nuevamente.", false);
      } else {
        const errorMsg =
          resultado?.data?.message || resultado?.message || "Error desconocido";
        showAlert(`❌ Error: ${errorMsg}`, false);
      }
    } catch (error) {
      console.error("🚨 Error al crear tratamientos:", error);
      showAlert("❌ Error de conexión", false);
    } finally {
      setLoadingMultiple(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <div className='bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl mb-10 mt-10'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold'>
            {modoMultiple
              ? "💊 Crear Múltiples Tratamientos"
              : "💊 Formulario Tratamiento"}
          </h2>

          {/* Toggle para cambiar modo */}
          <div className='flex items-center gap-3'>
            <span className='text-sm text-gray-600'>Modo:</span>
            <button
              type='button'
              onClick={() => setModoMultiple(!modoMultiple)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                modoMultiple
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {modoMultiple ? "📋 Múltiple" : "📝 Individual"}
            </button>
          </div>
        </div>

        {/* Información del modo */}
        <div className='mb-6 p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50'>
          <p className='text-sm text-blue-700'>
            {modoMultiple
              ? "📋 Modo Múltiple: Puedes crear varios tratamientos a la vez. Útil para cargas masivas."
              : "📝 Modo Individual: Crea un tratamiento por vez usando el formulario tradicional."}
          </p>
        </div>

        {!modoMultiple ? (
          /* FORMULARIO INDIVIDUAL (Original) */
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            {/* Nombre del Tratamiento */}
            <div>
              <label className='block text-gray-600' htmlFor='nombre'>
                Nombre del Tratamiento *
              </label>
              <input
                type='text'
                id='nombre'
                {...register("nombre", {
                  required: "Este campo es obligatorio",
                })}
                className='w-full px-4 py-2 mt-2 border rounded-md focus:ring focus:ring-indigo-300'
                placeholder='Ej: Antibiótico Amoxicilina'
              />
              {errors.nombre && (
                <span className='text-red-500'>{errors.nombre.message}</span>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className='block text-gray-600' htmlFor='descripcion'>
                Descripción *
              </label>
              <textarea
                id='descripcion'
                rows='3'
                {...register("descripcion", {
                  required: "Este campo es obligatorio",
                })}
                className='w-full px-4 py-2 mt-2 border rounded-md focus:ring focus:ring-indigo-300 resize-none'
                placeholder='Describe el tratamiento, dosis, aplicación, etc.'
              />
              {errors.descripcion && (
                <span className='text-red-500'>
                  {errors.descripcion.message}
                </span>
              )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Tipo de Enfermedad */}
              <div>
                <label
                  className='block text-gray-600'
                  htmlFor='tipo_enfermedad'
                >
                  Tipo de Enfermedad *
                </label>
                <select
                  id='tipo_enfermedad'
                  {...register("tipo_enfermedad", {
                    required: "Debes seleccionar un tipo de enfermedad",
                  })}
                  className='w-full px-4 py-2 mt-2 border rounded-md focus:ring focus:ring-indigo-300 bg-white'
                >
                  <option value=''>Selecciona un tipo de enfermedad</option>
                  {tiposEnfermedad.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
                {errors.tipo_enfermedad && (
                  <span className='text-red-500'>
                    {errors.tipo_enfermedad.message}
                  </span>
                )}
              </div>

              {/* Turno del Tratamiento */}
              <div>
                <label className='block text-gray-600' htmlFor='turno'>
                  Turno del Tratamiento *
                </label>
                <select
                  id='turno'
                  {...register("turno", {
                    required: "Debes seleccionar un turno",
                  })}
                  className='w-full px-4 py-2 mt-2 border rounded-md focus:ring focus:ring-indigo-300 bg-white'
                >
                  <option value=''>Selecciona un turno</option>
                  {turnosTratamiento.map((turno) => (
                    <option key={turno.value} value={turno.value}>
                      {turno.label}
                    </option>
                  ))}
                </select>
                {errors.turno && (
                  <span className='text-red-500'>{errors.turno.message}</span>
                )}
              </div>
            </div>

            {/* Fecha de Tratamiento */}
            <div>
              <label
                className='block text-gray-600'
                htmlFor='fecha_tratamiento'
              >
                Fecha de Tratamiento *
              </label>
              <input
                type='date'
                id='fecha_tratamiento'
                {...register("fecha_tratamiento", {
                  required: "Este campo es obligatorio",
                })}
                className='w-full px-4 py-2 mt-2 border rounded-md focus:ring focus:ring-indigo-300'
              />
              {errors.fecha_tratamiento && (
                <span className='text-red-500'>
                  {errors.fecha_tratamiento.message}
                </span>
              )}
            </div>

            {/* Botones de navegación */}
            <div className='flex justify-between mt-6'>
              <button
                type='button'
                onClick={() => setStep((prevStep) => prevStep - 1)}
                className='px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600'
              >
                Atrás
              </button>
              <button
                type='submit'
                className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700'
              >
                💾 Guardar Tratamiento
              </button>
            </div>
          </form>
        ) : (
          /* FORMULARIO MÚLTIPLE (Nuevo) */
          <div className='space-y-6'>
            {/* Lista de tratamientos */}
            <div className='space-y-4'>
              {tratamientos.map((tratamiento, index) => (
                <div
                  key={index}
                  className='border border-gray-300 rounded-lg p-4 bg-gray-50'
                >
                  <div className='flex items-center justify-between mb-4'>
                    <h4 className='font-medium text-gray-800'>
                      Tratamiento #{index + 1}
                    </h4>
                    <div className='flex gap-2'>
                      <button
                        type='button'
                        onClick={() => duplicarTratamiento(index)}
                        className='text-blue-600 hover:text-blue-700 text-sm'
                        title='Duplicar tratamiento'
                      >
                        📋 Duplicar
                      </button>
                      {tratamientos.length > 1 && (
                        <button
                          type='button'
                          onClick={() => eliminarTratamiento(index)}
                          className='text-red-600 hover:text-red-700 text-sm'
                          title='Eliminar tratamiento'
                        >
                          🗑️ Eliminar
                        </button>
                      )}
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {/* Nombre */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Nombre *
                      </label>
                      <input
                        type='text'
                        value={tratamiento.nombre}
                        onChange={(e) =>
                          actualizarTratamiento(index, "nombre", e.target.value)
                        }
                        className='w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                        placeholder='Ej: Antibiótico Amoxicilina'
                      />
                    </div>

                    {/* Tipo de enfermedad */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Tipo de Enfermedad *
                      </label>
                      <select
                        value={tratamiento.tipo_enfermedad}
                        onChange={(e) =>
                          actualizarTratamiento(
                            index,
                            "tipo_enfermedad",
                            e.target.value
                          )
                        }
                        className='w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                      >
                        <option value=''>Selecciona tipo</option>
                        {tiposEnfermedad.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Turno */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Turno *
                      </label>
                      <select
                        value={tratamiento.turno}
                        onChange={(e) =>
                          actualizarTratamiento(index, "turno", e.target.value)
                        }
                        className='w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                      >
                        <option value=''>Selecciona turno</option>
                        {turnosTratamiento.map((turno) => (
                          <option key={turno.value} value={turno.value}>
                            {turno.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Fecha */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Fecha de Tratamiento *
                      </label>
                      <input
                        type='date'
                        value={tratamiento.fecha_tratamiento}
                        onChange={(e) =>
                          actualizarTratamiento(
                            index,
                            "fecha_tratamiento",
                            e.target.value
                          )
                        }
                        className='w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                      />
                    </div>

                    {/* Descripción */}
                    <div className='md:col-span-2'>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Descripción *
                      </label>
                      <textarea
                        value={tratamiento.descripcion}
                        onChange={(e) =>
                          actualizarTratamiento(
                            index,
                            "descripcion",
                            e.target.value
                          )
                        }
                        className='w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                        rows='3'
                        placeholder='Describe el tratamiento, dosis, aplicación, etc.'
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Botón para agregar más tratamientos */}
            <div className='text-center'>
              <button
                type='button'
                onClick={agregarTratamiento}
                className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors'
              >
                ➕ Agregar Otro Tratamiento
              </button>
            </div>

            {/* Resumen */}
            <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
              <h3 className='font-medium text-gray-800 mb-2'>📊 Resumen</h3>
              <p className='text-sm text-gray-600'>
                <strong>Total de tratamientos:</strong> {tratamientos.length}
              </p>
              <div className='mt-2 text-xs text-gray-500'>
                <strong>Distribución:</strong>
                {tiposEnfermedad
                  .map((tipo) => {
                    const count = tratamientos.filter(
                      (t) => t.tipo_enfermedad === tipo.value
                    ).length;
                    return count > 0 ? ` ${tipo.label}: ${count}` : "";
                  })
                  .filter(Boolean)
                  .join(" | ")}
              </div>
            </div>

            {/* Botones de acción múltiple */}
            <div className='flex gap-4 pt-4'>
              <button
                type='button'
                onClick={() => setStep((prevStep) => prevStep - 1)}
                disabled={loadingMultiple}
                className='bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-md transition-colors disabled:opacity-50'
              >
                Atrás
              </button>
              <button
                type='button'
                onClick={onSubmitMultiple}
                disabled={loadingMultiple || !validarTratamientosMultiples()}
                className='flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-md transition-colors disabled:opacity-50'
              >
                {loadingMultiple ? (
                  <div className='flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                    Creando...
                  </div>
                ) : (
                  `💾 Crear ${tratamientos.length} Tratamiento${
                    tratamientos.length > 1 ? "s" : ""
                  }`
                )}
              </button>
            </div>
          </div>
        )}

        {/* Alert Message */}
        {tratamientoAlert.status && (
          <div
            className={`mt-4 p-3 rounded-md text-center font-medium ${
              tratamientoAlert.estado
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {tratamientoAlert.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormularioTratamiento;
