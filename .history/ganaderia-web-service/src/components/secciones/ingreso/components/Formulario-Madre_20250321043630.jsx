import { useBussinesMicroservicio } from '@/hooks/bussines';
import React, {  useState } from 'react';
import { useForm } from 'react-hook-form';
import SeleccionarPadre from './Select-Padre';


const FormularioMadre = ({ setStep }) => {


  const {crearMadreHook} = useBussinesMicroservicio();

  const { register, handleSubmit, formState: { errors },reset } = useForm();
  const [idPadres,setIdPadres] = useState([]);
  const [madreAlert, setMadreAlert] = useState({ status: false, message: "",estado:true });

  const handleObetenerPadre = (id) => {
      let idPadreNumber = parseInt(id);
      setIdPadres([...idPadres,idPadreNumber]);
  }


  const handleNext = async (data) => {
    
/*     if(idPadres.length >=0){ */
      let newMadre = {
        "nombre": data?.nombre,
        "rp_madre": data?.rp_madre,
        "estado": data?.estado,
        "observaciones":data?.observaciones,
        "fecha_nacimiento": data?.fecha_nacimiento,
        "id_padre": idPadres
    }
    const resMadreCreada = await crearMadreHook(newMadre);
    if(resMadreCreada?.status == 201){
       setMadreAlert({ status: true, message: "SE HA RESGISTRADO CORRECTAMENTE LA MADRE",estado:true });
       reset();
       setIdPadres([]);
    }else{
        setMadreAlert({ status: true, message: "ERROR 401, SESSION CADUCADA", estado:false });
        reset();
        setIdPadres([]);
    }

/*     }else{
      setMadreAlert({ status: true, message: "ERROR, DEBE INGRESAR AL MENOS 1 PADRE", estado:false });
    } */
    /* setStep(2); */ // Ir al siguiente formulario
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mb-10 mt-10">
          <form onSubmit={handleSubmit(handleNext)}>
            <h2 className="text-2xl font-bold text-center mb-6">Formulario Madre</h2>

            <div className="mb-4">
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                {...register('nombre', { required: 'El nombre es obligatorio' })}
                placeholder="Nombre"
                className="w-full p-3 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.nombre && <span className="text-red-500 text-sm">{errors.nombre.message}</span>}
            </div>

            <div className="mb-4">
              <label htmlFor="rp_madre" className="block text-sm font-medium text-gray-700">RP Madre</label>
              <input
                type="number"
                {...register('rp_madre', { required: 'El RP Madre es obligatorio' })}
                placeholder="RP Madre"
                className="w-full p-3 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.rp_madre && <span className="text-red-500 text-sm">{errors.rp_madre.message}</span>}
            </div>

            <div className="mb-4">
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado</label>
              <select
                {...register('estado')}
                className="w-full p-3 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Seca">Seca</option>
                <option value="En Tambo">En Tambo</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">Observaciones</label>
              <textarea
                {...register('observaciones', { required: 'Las observaciones son obligatorias' })}
                placeholder="Observaciones"
                className="w-full p-3 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.observaciones && <span className="text-red-500 text-sm">{errors.observaciones.message}</span>}
            </div>

            <div className="mb-4">
              <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
              <input
                type="date"
                {...register('fecha_nacimiento', { required: 'La fecha de nacimiento es obligatoria' })}
                className="w-full p-3 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.fecha_nacimiento && <span className="text-red-500 text-sm">{errors.fecha_nacimiento.message}</span>}
            </div>

            <div className="mb-4">
              <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700">Seleccionar Padres</label>
              <SeleccionarPadre padreSeleccionado={handleObetenerPadre} />
            </div>
            
            <div className="mt-6 text-center">
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Guardar Madre
              </button>
            </div>
          </form>
          {madreAlert.status && (
          <p
            className={`text-white text-center text-sm font-semibold p-2 rounded-md shadow-md mt-2 
              ${madreAlert.estado ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {madreAlert.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default FormularioMadre;


