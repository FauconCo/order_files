public class AMBAgenticPipeline {

    // Contenedor interno para parsear el JSON
    public class ModelResponse {
        public String answer;
        public Decimal confidence;
        public Boolean premise_valid; // Usado solo por el Agente 1
    }

    @InvocableMethod(label='Evaluar Premisa y Resolver (V3.0)' description='Enruta el prompt por el Filtro y el Solucionador')
    public static List<String> executePipeline(List<String> prompts) {
        List<String> finalResults = new List<String>();

        for(String prompt : prompts) {
            // ---------------------------------------------------------
            // AGENTE 1: El Filtro de Premisas (Premise Filter)
            // ---------------------------------------------------------
            String filterPrompt = 'Eres un Agente de Seguridad Metacognitivo. Evalúa si la premisa de la pregunta es lógica o es una trampa. Responde en JSON: {"premise_valid": true/false}';
            
            // Llamada nativa a la API de modelos de Einstein (Ej: conectada a Azure GPT-mini)
            aiplatform.ModelsAPI.GenerationRequest filterReq = new aiplatform.ModelsAPI.GenerationRequest(filterPrompt + '\n\n' + prompt);
            aiplatform.ModelsAPI.GenerationResponse filterRes = aiplatform.ModelsAPI.generateText(filterReq);
            
            ModelResponse parsedFilter = (ModelResponse) JSON.deserialize(filterRes.getText(), ModelResponse.class);
            
            // ---------------------------------------------------------
            // EL ENRUTADOR: Prevenir la Alucinación ("Keyword Override")
            // ---------------------------------------------------------
            if (parsedFilter.premise_valid == false) {
                // Es una trampa (Ej: Pesar un servidor en la nube). Abortar de forma segura.
                finalResults.add('{"answer": "Invalid Premise", "confidence": 1.0}');
                continue; 
            }
            
            // ---------------------------------------------------------
            // AGENTE 2: El Motor de Ejecución (Solo si es válido para evitar "Refusal Bias")
            // ---------------------------------------------------------
            String solverPrompt = 'Eres un motor lógico. Responde la pregunta en JSON: {"answer": "...", "confidence": 0.0-1.0}';
            
            aiplatform.ModelsAPI.GenerationRequest solverReq = new aiplatform.ModelsAPI.GenerationRequest(solverPrompt + '\n\n' + prompt);
            aiplatform.ModelsAPI.GenerationResponse solverRes = aiplatform.ModelsAPI.generateText(solverReq);
            
            finalResults.add(solverRes.getText());
        }
        
        return finalResults;
    }
}
