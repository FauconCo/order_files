/**
 * logVetoAction: Cierra el ciclo de vida con snapshot de gobernanza.
 * Persiste el estado de veto y la configuración de umbral vigente en el Ledger.
 */
async function logVetoAction(
  entityId: string, 
  confidenceScore: number, 
  reason: string, 
  currentThreshold: number // Ahora capturamos el umbral configurado
) {
  try {
    const auditRecord = {
      Agent_ID__c: 'ALRO_SUPREME_V4.0_CORE',
      Action_Performed__c: `VETO_OPERATIVO: ${reason}`, 
      Timestamp__c: new Date().toISOString(),
      Confidence_Score__c: confidenceScore,
      Equivalence_Status__c: 'Escalated',
      // Sello de auditoría de gobernanza
      Current_Threshold_Snapshot__c: currentThreshold 
    };

    const result = await conn.sobject('AWU_Ledger__c').create(auditRecord);
    
    if (result.success) {
      console.log(`Trazabilidad sellada. Threshold en el momento del veto: ${currentThreshold}. ID: ${result.id}`);
      return result;
    }
  } catch (error) {
    console.error("ERROR CRÍTICO: Fallo en la persistencia del Ledger.", error);
  }
}
