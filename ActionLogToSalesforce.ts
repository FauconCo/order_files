// app/api/agentforce/route.ts

async function logToSalesforce(conn: any, data: any) {
  // Operación de trazabilidad inmutable
  return await conn.sobject("AWU_Ledger__c").create({
    Agent_ID__c: "ALRO_Engine_v4",
    Action_Performed__c: data.intentCode,
    Timestamp__c: new Date().toISOString(),
    Confidence_Score__c: data.confidence || 0,
    Equivalence_Status__c: data.status
  });
}

export async function POST(req: Request) {
  const rawPayload = await req.json();
  const validation = IntentVectorSchema.safeParse(rawPayload);
  
  // Conexión a Salesforce
  const conn = new jsforce.Connection({ /* config */ });
  await conn.login(process.env.SF_USERNAME, process.env.SF_PASSWORD);

  if (!validation.success) {
    // Trazabilidad de fallo (Veto Operativo)
    await logToSalesforce(conn, { 
      intentCode: rawPayload.intentCode || "INVALID", 
      status: "Vetoed" 
    });
    return NextResponse.json({ error: "Veto Operativo" }, { status: 406 });
  }

  // Ejecución de Lógica y Registro de Éxito
  try {
    const result = await conn.apex.post('/services/apexrest/DashboardAction/', validation.data);
    
    // Registro de trazabilidad de éxito
    await logToSalesforce(conn, { 
      intentCode: validation.data.intentCode, 
      status: "Success",
      confidence: 0.99 
    });
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Routing Fail" }, { status: 500 });
  }
}
