import { NextResponse } from 'next/server';
import { z } from 'zod';
import jsforce from 'jsforce';

// Contrato restrictivo para prevenir inyecciones (Workslop)
const IntentVectorSchema = z.object({
    entityId: z.string().min(15).max(18),
    intentCode: z.enum(),
    timestamp: z.string().datetime(),
    contextMetadata: z.object({ channel: z.string(), securityToken: z.string().uuid() })
});

const CONFIDENCE_THRESHOLD = 0.94; // Disyuntor cognitivo 

export async function POST(req: Request) {
    try {
        const rawPayload = await req.json();
        const validation = IntentVectorSchema.safeParse(rawPayload);

        if (!validation.success) {
            console.error("Veto Operativo - Vector Malformado:", validation.error);
            return NextResponse.json({ error: "Veto Operativo", details: validation.error.issues }, { status: 406 });
        }

        const { entityId, intentCode, timestamp } = validation.data;
        
        // Conecta el HTTP hacia Salesforce
        const conn = new jsforce.Connection({
            oauth2: { clientId: process.env.SF_CLIENT_ID, clientSecret: process.env.SF_CLIENT_SECRET, redirectUri: 'http://localhost:3000/callback' }
        });
        await conn.login(process.env.SF_USERNAME!, process.env.SF_PASSWORD!);

        // Dispara el Flow Builder en Salesforce
        const result = await conn.apex.post('/VisualLogic_Dashboard_Orchestrator/', { entityId, taxonomyCode: intentCode, timestamp });

        if (result.confidenceScore < CONFIDENCE_THRESHOLD) {
            return NextResponse.json({ status: 'ESCALATED', message: 'Confianza insuficiente; escalando a humano' }, { status: 422 });
        }

        return NextResponse.json({ status: 'SUCCESS', data: result });
    } catch (error: any) {
        return NextResponse.json({ error: 'Fallo en la matriz de ejecución: ' + error.message }, { status: 500 });
    }
}
