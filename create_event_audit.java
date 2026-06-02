public with sharing class AgentController {
    @AuraEnabled
    public static String processAgentLogic(String prompt) {
        try {
            // Simulamos la búsqueda en Knowledge para la Demo
            String knowledgeSource = 'Articulo_Definicion_Ventas_v2';
            
            // Registramos la trazabilidad al instante
            logTrazabilidad('Resolución Autónoma', 'Exitosa', 'Prompt: ' + prompt + ' | Origen de Verdad: ' + knowledgeSource);

            // Devolvemos el JSON que armará tu UI
            return '{"status":"success", "kpi":"Revenue", "value":"$45,000", "source":"' + knowledgeSource + '"}';
            
        } catch (Exception e) {
            logTrazabilidad('Ejecución', 'Error', e.getMessage());
            throw new AuraHandledException('Error en la lógica: ' + e.getMessage());
        }
    }

    private static void logTrazabilidad(String action, String status, String details) {
        Audit_Event__c event = new Audit_Event__c(
            Action__c = action,
            Status__c = status,
            Details__c = details,
            Timestamp__c = DateTime.now()
        );
        insert event;
    }
}
