using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlanNutricionalController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public PlanNutricionalController(SoftSportDbContext context)
        {
            _context = context;
        }

        // GET: api/plannutricional/alumno/5
        [HttpGet("alumno/{alumnoId}")]
        public async Task<ActionResult<IEnumerable<PlanNutricional>>> GetPlanesByAlumno(int alumnoId)
        {
            return await _context.PlanesNutricionales
                .Include(p => p.Suplementaciones)
                .Where(p => p.AlumnoId == alumnoId && p.FechaAnulacion == null)
                .OrderByDescending(p => p.FechaInicio)
                .ToListAsync();
        }

        // GET: api/plannutricional/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PlanNutricional>> GetPlan(int id)
        {
            var plan = await _context.PlanesNutricionales
                .Include(p => p.Suplementaciones)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (plan == null)
            {
                return NotFound();
            }

            return plan;
        }

        // POST: api/plannutricional
        [HttpPost]
        public async Task<ActionResult<PlanNutricional>> PostPlan(PlanNutricional plan)
        {
            _context.PlanesNutricionales.Add(plan);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPlan", new { id = plan.Id }, plan);
        }

        // PUT: api/plannutricional/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPlan(int id, PlanNutricional plan)
        {
            if (id != plan.Id)
            {
                return BadRequest();
            }

            // Para manejar la actualización de suplementos (eliminación/adición), es más complejo con EF Core desconectado.
            // Una estrategia simple es borrar los anteriores y agregar los nuevos, o dejar que el frontend maneje los suplementos por separado si fuera necesario.
            // Dado que el plan incluye la lista, intentaremos actualizar la lista.
            
            var existingPlan = await _context.PlanesNutricionales
                .Include(p => p.Suplementaciones)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (existingPlan == null)
            {
                return NotFound();
            }

            // Actualizar campos del plan
            _context.Entry(existingPlan).CurrentValues.SetValues(plan);

            // Actualizar Suplementos
            // 1. Eliminar los que ya no están
            foreach (var existingSuplemento in existingPlan.Suplementaciones.ToList())
            {
                if (!plan.Suplementaciones.Any(s => s.Id == existingSuplemento.Id))
                {
                    _context.Suplementaciones.Remove(existingSuplemento);
                }
            }

            // 2. Agregar o actualizar los que vienen
            foreach (var newSuplemento in plan.Suplementaciones)
            {
                var existingSuplemento = existingPlan.Suplementaciones
                    .FirstOrDefault(s => s.Id == newSuplemento.Id && s.Id != 0);

                if (existingSuplemento != null)
                {
                    // Actualizar
                    _context.Entry(existingSuplemento).CurrentValues.SetValues(newSuplemento);
                }
                else
                {
                    // Insertar nuevo. Asegurarse que el ID sea 0 para que EF lo trate como nuevo
                    newSuplemento.Id = 0;
                    existingPlan.Suplementaciones.Add(newSuplemento);
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PlanExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/plannutricional/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlan(int id)
        {
            var plan = await _context.PlanesNutricionales.FindAsync(id);
            if (plan == null)
            {
                return NotFound();
            }

            _context.PlanesNutricionales.Remove(plan);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PlanExists(int id)
        {
            return _context.PlanesNutricionales.Any(e => e.Id == id);
        }
    }
}
