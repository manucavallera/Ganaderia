import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useBussinesMicroservicio } from '@/hooks/bussines';
import SeleccionarTernero from "./Select-Ternero";
import SeleccionarTratamiento from "./Select-Tratamiento";

const FormularioTerneroTratamiento = ({ setStep }) => {

  const { crearTratamientoTerneroHook} = useBussinesMicroservicio();
  const [tratamientoTerneroAlert, setTratamientoTerneroAlert] = useState({ status: false, message: "",estado:true });
  const [terneroId,setTerneroId] = useState(0);
  const [tratamientoId,setTratamientoId] = useState(0);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();



  const handleTerneroId = (id) => {
      var idTenero = parseInt(id);
      setTerneroId(idTenero);
  }


  const handleTratamientoId = (id) => {
    var idTratamiento = parseInt(id);
    setTratamientoId(idTratamiento);
}


  const onSubmit = async (data) => {
 
    let newTratamientoTernero = {
      "id_ternero": terneroId,
      "id_tratamiento": tratamientoId,
      "fecha_aplicacion": data.fechaAplicacion
    }
   
    if(newTratamientoTernero.id_ternero ===0){
       setTratamientoTerneroAlert({ status: true, message: "ERROR, DEBE DE SELECCIONAR UN TERNERO", estado:false });
    }else if (newTratamientoTernero.id_tratamiento ===0) {
       setTratamientoTerneroAlert({ status: true, message: "ERROR 401, DEBE DE SELECCIONAR UN TRATAMIENTO", estado:false });
    }else{
      const resCrearTratamientoTernero = await crearTratamientoTerneroHook(newTratamientoTernero);
      if(resCrearTratamientoTernero?.status == 201){
          setTratamientoTerneroAlert({ status: true, message: "SE HA RESGISTRADO CORRECTAMENTE EL TRATAMIENTO TERNERO",estado:true });
          reset();
        }else{
          setTratamientoTerneroAlert({ status: true, message: "ERROR 401, SESSION CADUCADA", estado:false });
          reset();
      }
    }

   /*  setStep(6); */
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mb-10 mt-10">
        <h2 className="text-2xl font-bold text-center mb-6">Formulario Tratamiento Ternero</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="ternero_id" className="block text-sm font-medium text-gray-700">ID del Ternero</label>
            <SeleccionarTernero  terneroSeleccionado={handleTerneroId}/>
          </div>

          <div className="mb-4">
            <label htmlFor="tratamiento_id" className="block text-sm font-medium text-gray-700">ID del Tratamiento</label>
            
            <SeleccionarTratamiento tratamientoSeleccionado={handleTratamientoId} />
          </div>

          <div className="mb-4">
            <label htmlFor="fecha_aplicacion" className="block text-sm font-medium text-gray-700">Fecha de Aplicación</label>
            <input
              type="date"
              id="fecha_aplicacion"
              {...register("fechaAplicacion", { required: "Este campo es obligatorio" })}
              className="w-full p-3 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.fechaAplicacion && <p className="text-red-500 text-sm">{errors.fechaAplicacion.message}</p>}
          </div>

          <div className="mt-6 text-center flex justify-between">
            <button
              type="button"
              className="w-5/12 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              onClick={() => setStep(2)}
            >
              Siguiente
            </button>
            <button
              type="submit"
              className="w-5/12 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                
                Guardar Trata.Ternero

            </button>
          </div>
        </form>
        {tratamientoTerneroAlert.status && (
          <p
            className={`text-white text-center text-sm font-semibold p-2 rounded-md shadow-md mt-2 
              ${tratamientoTerneroAlert.estado ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {tratamientoTerneroAlert.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default FormularioTerneroTratamiento;


