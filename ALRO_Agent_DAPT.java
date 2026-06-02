/**
 * @description Agente DAPT v6.1 - Encargado de la Adaptación de Dominio y Aprendizaje Contextual.
 * Convierte un problema genérico en una instrucción ultra-especializada basada en la ontología del CRM.
 */
public with sharing class ALRO_Agent_DAPT {

    // Estructuras de datos para el contrato de Agentforce
    public class InboundPayload {
        @InvocableVariable(required=true description='Texto crudo del problema o caso ingresado')
        public String rawProblemText;
        @InvocableVariable(required=true description='ID del caso o registro en Salesforce')
        public Id recordId;
    }

    public class OutboundContext {
        @InvocableVariable(description='Instrucción enriquecida con las reglas de dominio de la empresa')
        public String specializedInstruction;
        @InvocableVariable(description='Veracidad del contexto recuperado')
        public Boolean domainAdapted;
    }

    @InvocableMethod(label='DAPT: Adaptar Dominio Cognitivo' description='Alinea el modelo con las reglas específicas de la empresa usando Salesforce Knowledge')
    public static List<OutboundContext> adaptDomain(List<InboundPayload> requests) {
        List<OutboundContext> results = new List<OutboundContext>();

        for (InboundPayload req : requests) {
            OutboundContext ctx = new OutboundContext();
            ctx.domainAdapted = false;
            
            try {
                // 1. Extraer palabras clave del problema para la búsqueda semántica
                String searchTerm = req.rawProblemText.abbreviate(100);
                
                // 2. Ejecutar búsqueda SOSL/Semántica sobre los artículos de conocimiento del Banco/Empresa
                // Nota: En producción, esto se conecta al Vector Index de Data Cloud
                List<List<SObject>> searchList = [FIND :searchTerm IN ALL FIELDS RETURNING 
                    Knowledge__kav(Title, Summary, Answer__c WHERE ValidationStatus = 'Validated' AND IsLatestVersion = true)];
                
                String enterpriseRules = '';
                if (!searchList[0].isEmpty()) {
                    Knowledge__kav article = (Knowledge__kav)searchList[0][0];
                    enterpriseRules = ' [REGLA DE DOMINIO INYECTADA]: ' + article.Answer__c;
                    ctx.domainAdapted = true;
                } else {
                    enterpriseRules = ' [REGLA DE DOMINIO]: Usar protocolo operativo estándar por defecto.';
                }

                // 3. Sintetizar la instrucción especializada para el siguiente agente del enjambre
                ctx.specializedInstruction = 'CONTEXTO OPERATIVO ENTORNO CORPORATIVO.\n' +
                                              'Problema del cliente: ' + req.rawProblemText + '\n' +
                                              enterpriseRules + '\n' +
                                              'Procesar bajo lineamientos estrictos de cumplimiento fiduciario.';
                
            } catch (Exception e) {
                System.debug('⚠️ Fallo en el Agente DAPT: ' + e.getMessage());
                ctx.specializedInstruction = 'Problema: ' + req.rawProblemText + ' (Fallo de adaptación de dominio).';
            }
            
            results.add(ctx);
        }
        return results;
    }
}
