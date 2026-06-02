// app/api/agentforce/route.ts
import { NextResponse } from 'next/server';
import jsforce from 'jsforce';

// Configuración de conexión stateless conforme a ALRO v6.0
const conn = new jsforce.Connection({
  oauth2: {
    clientId: process.env.SF_CLIENT_ID,
    clientSecret: process.env.SF_CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/callback' 
  }
});

export async function POST(req: Request) {
  try {
    const { entityId, taxonomyCode, intentPayload } = await req.json();

    // 1. Validación del Vector de Inicialización de Intención
    if (!entityId || !taxonomyCode) {
      return NextResponse.json({ error: 'Payload malformado: Falta vector de inicialización' }, { status: 400 });
    }

    // 2. Login asíncrono
    await conn.login(process.env.SF_USERNAME!, process.env.SF_PASSWORD!);

    // 3. Ejecución del Flow Orquestador (VisualLogic_Dashboard_Orchestrator)
    // El Flow gestiona la persistencia en AWU_Ledger__c para trazabilidad [cite: 477, 511]
    const result = await conn.apex.post('/VisualLogic_Dashboard_Orchestrator/', {
      entityId,
      taxonomyCode,
      timestamp: new Date().toISOString(), // Anclaje cronológico absoluto [cite: 551]
      intentPayload
    });

    // 4. Manejo de escalamiento inteligente (Escalation to human) [cite: 512, 517]
    if (result.confidenceScore < 0.94) {
      return NextResponse.json({ 
        status: 'ESCALATED', 
        message: 'Confianza insuficiente; escalando a humano',
        reason: result.escalationReason 
      }, { status: 422 });
    }

    return NextResponse.json({ status: 'SUCCESS', data: result });

  } catch (error) {
    return NextResponse.json({ error: 'Fallo en la matriz de ejecución: ' + error.message }, { status: 500 });
  }
}