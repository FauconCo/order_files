// Dentro de tu componente principal (Dashboard.tsx)
const handleOrchestration = async () => {
  setLoading(true);
  try {
    const response = await fetch('/api/agentforce', { ... });
    const result = await response.json();

    if (response.status === 422) {
      // VETO OPERATIVO DETECTADO
      setVetoState({ active: true, reason: result.reason });
    } else {
      setDashboardData(result.data);
    }
  } catch (error) {
    console.error("Fallo crítico en matriz:", error);
  } finally {
    setLoading(false);
  }
};