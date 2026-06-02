@RestResource(urlMapping='/aimo/v1/predict/*')
global with sharing class AIMO3InferenceGateway {

    // Equivalente a tu CFG.system_prompt
    private static final String SYSTEM_PROMPT = 
        'Actúa como un Gran Maestro Matemático. Reduce los números astronómicos usando Teoría de Números. ' +
        'Genera la estrategia en código Python dentro de bloques ```python``` y el resultado final en \\boxed{}.';

    // PUNTO DE ENTRADA (Equivalente a tu predict() y kaggle_evaluation)
    @HttpPost
    global static ResponseDto solveProblem(String problemId, String problemText) {
        ResponseDto response = new ResponseDto();
        response.id = problemId;
        
        try {
            // 1. Solicitar el razonamiento al LLM (Reemplaza a tu llamada vLLM/OpenAI)
            String llmResponse = requestLLMReasoning(problemText);
            
            // 2. Extraer el código Python generado por el LLM
            String pythonCode = extractPythonCode(llmResponse);
            
            // 3. Ejecutar en Sandbox Externo (Reemplaza a tu AIMO3Sandbox)
            // Como Apex no corre Python, delegamos esto a un microservicio en Heroku
            Integer finalAnswer = executeInHerokuSandbox(pythonCode);
            
            // 4. Fallback: Si el código falla, intentamos extraer la respuesta del texto
            if (finalAnswer == -1) {
                finalAnswer = extractBoxedAnswer(llmResponse);
            }
            
            response.answer = finalAnswer;
            
        } catch (Exception e) {
            System.debug('🚨 ERROR CRÍTICO en el motor: ' + e.getMessage());
            response.answer = 0; // Fallback de emergencia
        }
        
        return response;
    }

    // ----------------------------------------------------------------------
    // MÉTODOS DE SOPORTE (La Lógica Interna)
    // ----------------------------------------------------------------------

    private static String requestLLMReasoning(String prompt) {
        // Enrutamos la petición a través de la API de Modelos de Salesforce (Einstein)
        // Esto asume que tienes configurado tu modelo Qwen en Einstein Studio (BYOM)
        aiplatform.ModelsAPI.GenerationRequest req = new aiplatform.ModelsAPI.GenerationRequest(SYSTEM_PROMPT + '\n\n' + prompt);
        aiplatform.ModelsAPI.GenerationResponse res = aiplatform.ModelsAPI.generateText(req);
        return res.getText();
    }

    private static String extractPythonCode(String text) {
        // Lógica Regex para encontrar ```python ... ```
        Matcher m = Pattern.compile('(?s)```python\\s*(.*?)\\s*```').matcher(text);
        if (m.find()) {
            return m.group(1);
        }
        return '';
    }

    private static Integer executeInHerokuSandbox(String code) {
        if (String.isBlank(code)) return -1;
        
        // Llamada REST a tu entorno aislado (El equivalente a tu Jupyter Kernel)
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:AIMO_Heroku_Sandbox/execute'); // Usando Named Credentials
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setBody('{"code": "' + code.escapeJava() + '", "timeout": 10.0}');
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        if (res.getStatusCode() == 200) {
            Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            return (Integer) result.get('answer');
        }
        return -1;
    }

    private static Integer extractBoxedAnswer(String text) {
        // Equivalente a tu método _extract_boxed
        Matcher m = Pattern.compile('\\\\boxed\\{([^}]+)\\}').matcher(text);
        if (m.find()) {
            String val = m.group(1).replaceAll(',', '');
            Matcher numMatcher = Pattern.compile('-?\\d+').matcher(val);
            if (numMatcher.find()) {
                return Integer.valueOf(numMatcher.group());
            }
        }
        return -1;
    }

    // DTO de respuesta para respetar el formato de Kaggle / AIMO
    global class ResponseDto {
        global String id;
        global Integer answer;
    }
}