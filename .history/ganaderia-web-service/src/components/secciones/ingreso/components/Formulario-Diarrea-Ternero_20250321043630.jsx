import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBussinesMicroservicio } from '@/hooks/bussines';
import SeleccionarTernero from './Select-Ternero';
const FormularioDiarreaTernero = ({ setStep }) => {

  const {crearDiarreTerneroHook} = useBussinesMicroservicio();
  const [diarreaTerneroAlert, setDiarreaTerneroAlert] = useState({ status: false, message: "",estado:true });
  const { register, handleSubmit, formState: { errors },reset } = useForm();
  const [fechaDiarrea, setFechaDiarrea] = useState('');
  const [severidad, setSeveridad] = useState('');
  const [terneroId, setTerneroId] = useState(0);


  const handleTerneroId = (id) => {
    var idTenero = parseInt(id);
    setTerneroId(idTenero);
 }


  // Maneja el submit y envía los datos
  const onSubmit = async () => {

    let newDiarreaTernero = {
      "fecha_diarrea_ternero": fechaDiarrea,
      "severidad": severidad,
      "id_ternero":terneroId
    }
   
     if(newDiarreaTernero.id_ternero ===0){
      setDiarreaTerneroAlert({ status: true, message: "ERROR, DEBE DE SELECCIONAR UN TERNERO", estado:false });
   }else{
     const resCrearDiarreaTernero = await crearDiarreTerneroHook(newDiarreaTernero);
     if(resCrearDiarreaTernero?.status == 201){
         setDiarreaTerneroAlert({ status: true, message: "SE HA RESGISTRADO CORRECTAMENTE EL TRATAMIENTO TERNERO",estado:true });
         setFechaDiarrea('')
         setSeveridad('')
         setTerneroId(0);
         reset();
       }else{
         setDiarreaTerneroAlert({ status: true, message: "ERROR 401, SESSION CADUCADA", estado:false });
         setFechaDiarrea('')
         setSeveridad('')
         setTerneroId(0);
         reset();
     }
   }  

    /* setStep(7); */ // Cambia al siguiente paso
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mb-10 mt-10">
      <h2 className="text-2xl font-bold text-center mb-6">Formulario Diarrea ternero</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="ternero_id" className="block text-sm font-medium text-gray-700">ID del Ternero</label>
            <SeleccionarTernero terneroSeleccionado={handleTerneroId}/>
          </div>

          <button 
            type="button" 
            onClick={() => setStep(2)}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
            Siguiente
          </button>
        </form>

        <h2 className="text-xl font-bold mt-6 mb-4 text-center">Detalles de la Diarrea</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="fecha_diarrea" className="block text-sm font-medium text-gray-700">Fecha de Diarrea</label>
            <input
              type="date"
              id="fecha_diarrea"
              value={fechaDiarrea}
              onChange={(e) => setFechaDiarrea(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
            {errors.fechaDiarrea && <p className="text-red-500 text-sm">{errors.fechaDiarrea.message}</p>}
          </div>

          <div>
            <label htmlFor="severidad" className="block text-sm font-medium text-gray-700">Severidad</label>
            <input
              type="text"
              id="severidad"
              value={severidad}
              onChange={(e) => setSeveridad(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
            {errors.severidad && <p className="text-red-500 text-sm">{errors.severidad.message}</p>}
          </div>
          <button 
            type="submit"
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition"
          >
            Guardar Diarre.Ternero
          </button>
        </form>
        {diarreaTerneroAlert.status && (
          <p
            className={`text-white text-center text-sm font-semibold p-2 rounded-md shadow-md mt-2 
              ${diarreaTerneroAlert.estado ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {diarreaTerneroAlert.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default FormularioDiarreaTernero;



