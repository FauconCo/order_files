import React, { useState, useEffect } from 'react';

const DashboardLoadingTheater = ({ isLoading, onComplete }) => {
  const [step, setStep] = useState(0);
  const loadingSteps = [
    "Anclando Datos (Data Cloud)...",
    "Validando Lógica ToT (AUQ)...",
    "Componiendo Estructura (CoDA)...",
    "Renderizando Componente..."
  ];

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 800); // 800ms por paso para simular rapidez operativa
      return () => clearInterval(interval);
    } else {
      setStep(0);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/10 backdrop-blur-md z-50">
      <div className="bg-white/20 p-8 rounded-2xl border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
        <div className="animate-pulse text-white text-xl font-semibold">
          {loadingSteps[step]}
        </div>
        <div className="mt-4 w-64 h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-400 transition-all duration-500 ease-out" 
            style={{ width: `${((step + 1) / loadingSteps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardLoadingTheater;