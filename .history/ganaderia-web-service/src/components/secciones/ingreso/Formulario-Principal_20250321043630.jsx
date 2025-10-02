import React,{ useState } from "react";

import FormularioMadre from "./components/Formulario-Madre";
import FormularioTernero from "./components/Formulario-Ternero";
import FormularioEvento from "./components/Formulario-Evento";
import FormularioTratamiento from "./components/Formulario-Tratamiento";
import FormularioTerneroTratamiento from "./components/Formulario-Ternero-Tratamiento";
import FormularioDiarreaTernero from "./components/Formulario-Diarrea-Ternero";
import ButtonSelect from "./components/Button-Select-Ingreso";
import FormularioPadre from "./components/Formulario-Padre";

const FormularioPrincipal = () => {
  const [step, setStep] = useState(1);

  return (
    <>
      {step  &&  <ButtonSelect setStep={setStep} />}
      {step === 1 && <FormularioPadre setStep={setStep} />}
      {step === 2 && <FormularioMadre setStep={setStep} />}
      {step === 3 && <FormularioTernero setStep={setStep} />}
      {step === 4 && <FormularioEvento setStep={setStep}/>}
      {step === 5 && <FormularioTratamiento setStep={setStep}/>}
      {step === 6 && <FormularioTerneroTratamiento setStep={setStep}/>}
      {step === 7 && <FormularioDiarreaTernero setStep={setStep}/>}
    </>
  );
};

export default FormularioPrincipal;
