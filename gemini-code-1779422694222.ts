<button 
  onClick={async () => {
    // 1. Sellado de Trazabilidad
    await logVetoAction(currentEntityId, 0.42, "Intervención solicitada por usuario");
    // 2. Disparo de flujo de escalamiento (ej. notificación por email o caso)
    triggerHumanExpertNotification(); 
  }}
  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-bold"
>
  Escalar a Experto
</button>