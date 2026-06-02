// app/api/agentforce/route.ts

// Configuración de la matriz de riesgo
// Ajustar este valor impacta directamente en la sensibilidad del Sistema 2 (UAR)
const CONFIDENCE_THRESHOLD = 0.94; // Threshold actual: 94%

export async function POST(req: Request) {
  try {
    const { entityId, taxonomyCode, intentPayload } = await req.json();

    // ... (Lógica de autenticación previa)

    const result = await conn.apex.post('/VisualLogic_Dashboard_Orchestrator/', {
      entityId,
      taxonomyCode,
      timestamp: new Date().toISOString(),
      intentPayload
    });

    // Validamos contra el nuevo umbral configurado
    if (result.confidenceScore < CONFIDENCE_THRESHOLD) {
      return NextResponse.json({ 
        status: 'ESCALATED', 
        message: 'Discrepancia técnica: umbral de confianza no alcanzado',
        reason: `El nivel de confianza (${result.confidenceScore}) es inferior al umbral requerido (${CONFIDENCE_THRESHOLD})`,
        escalationReason: 'AUQ_UNCERTAINTY_THRESHOLD_VIOLATION'
      }, { status: 422 });
    }

    return NextResponse.json({ status: 'SUCCESS', data: result });

  } catch (error) {
    return NextResponse.json({ error: 'Fallo en la matriz de ejecución: ' + error.message }, { status: 500 });
  }
}