/**
 * logVetoAction: Cierra el ciclo de vida de la transacción fallida.
 * Persiste el estado de veto en el Ledger inmutable de Salesforce.
 */
async function logVetoAction(entityId: string, confidenceScore: number, reason: string) {
  try {
    // Definimos el objeto de auditoría según el modelo AWU_Ledger__c
    const auditRecord = {
      Agent_ID__c: 'ALRO_SUPREME_V4.0_CORE',
      Action_Performed__c: `VETO_OPERATIVO: ${reason}`, // Contextualización de la anomalía
      Timestamp__c: new Date().toISOString(),           // Anclaje cronológico
      Confidence_Score__c: confidenceScore,             // Evidencia técnica del bajo umbral
      Equivalence_Status__c: 'Escalated'                // Cierre del estado lógico
    };

    // Inserción en la matriz de Ledger
    const result = await conn.sobject('AWU_Ledger__c').create(auditRecord);
    
    if (result.success) {
      console.log(`Trazabilidad sellada correctamente. ID de Registro: ${result.id}`);
      return result;
    } else {
      throw new Error("Fallo en la persistencia del Ledger");
    }
  } catch (error) {
    // Si la trazabilidad falla, activamos un log de emergencia (Fallback)
    console.error("ERROR CRÍTICO DE AUDITORÍA: El evento de Veto no fue registrado.", error);
  }
}