@RestResource(urlMapping='/AgentforceLottieAPI/*')
global with sharing class LottieAgentAPI {

    @HttpPost
    global static ResponsePayload hacerPregunta(String preguntaUsuario) {
        ResponsePayload res = new ResponsePayload();
        
        // 1. Aquí ALRO v6.1 evalúa la pregunta (Simulación de enrutamiento)
        if (preguntaUsuario.containsIgnoreCase('historial') || preguntaUsuario.containsIgnoreCase('datos')) {
            res.agente_activo = 'APPY'; // Agente LoCoBench
            res.respuesta = 'He revisado en Data Cloud. El historial del cliente está limpio.';
            res.lottie_url = 'https://assets.lottiefiles.com/robot_appy_typing.json';
            
        } else if (preguntaUsuario.containsIgnoreCase('riesgo') || preguntaUsuario.containsIgnoreCase('certeza')) {
            res.agente_activo = 'EINSTEIN'; // Agente AUQ
            res.respuesta = 'Mi cálculo de incertidumbre marca un 99% de seguridad. Cero alucinaciones.';
            res.lottie_url = 'https://assets.lottiefiles.com/robot_einstein_math.json';
            
        } else {
            res.agente_activo = 'ASTRO'; // El Orquestador / Gran Maestro
            res.respuesta = 'He auditado la solicitud y la he ejecutado exitosamente en el sistema.';
            res.lottie_url = 'https://assets.lottiefiles.com/robot_astro_success.json';
        }
        
        return res;
    }

    // El contrato JSON que tu página web va a leer
    global class ResponsePayload {
        global String agente_activo;
        global String respuesta;
        global String lottie_url;
    }
}
