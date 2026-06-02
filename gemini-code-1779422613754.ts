import React from 'react';

interface VetoProps {
  status: 'SUCCESS' | 'ESCALATED' | 'IDLE';
  reason?: string;
  onOverride: () => void;
}

const SafetyVetoInterlock: React.FC<VetoProps> = ({ status, reason, onOverride }) => {
  if (status !== 'ESCALATED') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-900/40 backdrop-blur-sm p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md border-l-8 border-red-600">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Veto Operativo Activado</h2>
        <p className="text-gray-700 mb-6">
          La matriz de riesgo ALRO ha detectado una discrepancia en el vector de intención: 
          <span className="font-mono block mt-2 bg-gray-100 p-2 rounded">{reason}</span>
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Reintentar
          </button>
          <button 
            onClick={onOverride}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-bold"
          >
            Escalar a Experto
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafetyVetoInterlock;