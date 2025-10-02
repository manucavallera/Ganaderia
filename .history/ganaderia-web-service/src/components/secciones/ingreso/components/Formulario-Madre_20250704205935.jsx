import { useBussinesMicroservicio } from "@/hooks/bussines";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const FormularioMadre = ({ setStep }) => {
  const { crearMadreHook } = useBussinesMicroservicio();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [madreAlert, setMadreAlert] = useState({
    status: false,
    message: "",
    estado: true,
  });

  const onSubmit = async (data) => {
    let newMadre = {
      nombre: data.nombre,
      rp_madre: data.rp_madre,
      estado: data.estado,
      observaciones: data.observaciones,
      fecha_nacimiento: data.fecha_nacimiento,
    };

    try {
      const resMadreCreada = await crearMadreHook(newMadre);
      if (resMadreCreada?.status == 201) {
        setMadreAlert({
          status: true,
          message: "SE HA REGISTRADO LA MADRE CORRECTAMENTE",
          estado: true,
        });
        reset();
      } else {
        setMadreAlert({
          status: true,
          message: "ERROR AL REGISTRAR LA MADRE",
          estado: false,
        });
        reset();
      }
    } catch (error) {
      setMadreAlert({
        status: true,
        message: "ERROR DE CONEXIÓN",
        estado: false,
      });
      reset();
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <div className='bg-white p-8 rounded-lg shadow-lg w-full max-w-md mb-10 mt-10'>
        <div>
          <h2 className='text-2xl font-bold text-center mb-6'>
            Formulario Madre
          </h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='mb-4'>
              <label
                htmlFor='nombre'
                className='block text-sm font-medium text-gray-700'
              >
                Nombre de la Madre
              </label>
              <input
                type='text'
                id='nombre'
                {...register("nombre", {
                  required: "Este campo es obligatorio",
                })}
                placeholder='Ej: Vaca María'
                className='w-full p-3 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
              />
              {errors.nombre && (
                <span className='text-red-500 text-sm'>
                  {errors.nombre.message}
                </span>
              )}
            </div>

            <div className='mb-4'>
              <label
                htmlFor='rp_madre'
                className='block text-sm font-medium text-gray-700'
              >
                RP Madre
              </label>
              <input
                type='number'
                id='rp_madre'
                {...register("rp_madre", {
                  required: "Este campo es obligatorio",
                })}
                placeholder='Número de registro'
                className='w-full p-3 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
              />
              {errors.rp_madre && (
                <span className='text-red-500 text-sm'>
                  {errors.rp_madre.message}
                </span>
              )}
            </div>

            <div className='mb-4'>
              <label
                htmlFor='estado'
                className='block text-sm font-medium text-gray-700'
              >
                Estado de la Madre
              </label>
              <select
                id='estado'
                {...register("estado")}
                className='w-full p-3 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
              >
                <option value='Seca'>Seca</option>
                <option value='En Tambo'>En Tambo</option>
              </select>
            </div>

            <div className='mb-4'>
              <label
                htmlFor='fecha_nacimiento'
                className='block text-sm font-medium text-gray-700'
              >
                Fecha de Nacimiento
              </label>
              <input
                type='date'
                id='fecha_nacimiento'
                {...register("fecha_nacimiento", {
                  required: "Este campo es obligatorio",
                })}
                className='w-full p-3 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
              />
              {errors.fecha_nacimiento && (
                <span className='text-red-500 text-sm'>
                  {errors.fecha_nacimiento.message}
                </span>
              )}
            </div>

            <div className='mb-4'>
              <label
                htmlFor='observaciones'
                className='block text-sm font-medium text-gray-700'
              >
                Observaciones
              </label>
              <textarea
                id='observaciones'
                {...register("observaciones", {
                  required: "Este campo es obligatorio",
                })}
                placeholder='Observaciones sobre la madre (salud, comportamiento, etc.)'
                rows={4}
                className='w-full p-3 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
              />
              {errors.observaciones && (
                <span className='text-red-500 text-sm'>
                  {errors.observaciones.message}
                </span>
              )}
            </div>

            <div className='mt-6 text-center'>
              <button
                type='submit'
                className='w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200'
              >
                Guardar Madre
              </button>
            </div>
          </form>

          {madreAlert.status && (
            <div
              className={`text-white text-center text-sm font-semibold p-3 rounded-md shadow-md mt-4 transition-all duration-300 ${
                madreAlert.estado ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {madreAlert.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormularioMadre;
