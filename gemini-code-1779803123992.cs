using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class EjecutarAwuController : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> RecibirPlanAgentico([FromBody] PlanAgenticoDto plan)
    {
        // La cruda verdad: Si llega aquí, Ngrok ya validó la firma HMAC. 
        // No hay necesidad de perder ciclos de CPU recalculando el hash.
        
        if (plan == null || string.IsNullOrEmpty(plan.AccionRequerida))
        {
            return BadRequest("Vector de ejecución inválido.");
        }

        // Ejecución determinista de la AWU
        bool resultado = await MatrizEjecucion.DispararAccion(plan.AccionRequerida, plan.Parametros);

        if (resultado)
            return Ok(new { Status = "AWU_Ejecutada_Exitosamente", RoiOperativo = 1.0 });
        
        return StatusCode(500, "Fricción operativa detectada en la Matriz AWU.");
    }
}