using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HistorialMedicoController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public HistorialMedicoController(SoftSportDbContext context)
        {
            _context = context;
        }

        // GET: api/historialmedico/alumno/5
        [HttpGet("alumno/{alumnoId}")]
        public async Task<ActionResult<IEnumerable<HistorialMedico>>> GetHistorialByAlumno(int alumnoId)
        {
            return await _context.HistorialMedico
                .Where(h => h.AlumnoId == alumnoId && h.FechaAnulacion == null)
                .OrderByDescending(h => h.FechaToma)
                .ToListAsync();
        }

        // POST: api/historialmedico
        [HttpPost]
        public async Task<ActionResult<HistorialMedico>> PostHistorialMedico(HistorialMedico historial)
        {
            _context.HistorialMedico.Add(historial);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetHistorialByAlumno", new { alumnoId = historial.AlumnoId }, historial);
        }

        // PUT: api/historialmedico/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutHistorialMedico(int id, HistorialMedico historial)
        {
            if (id != historial.Id)
            {
                return BadRequest();
            }

            // Validar que sea el último registro
            var lastRecord = await _context.HistorialMedico
                .Where(h => h.AlumnoId == historial.AlumnoId && h.FechaAnulacion == null)
                .OrderByDescending(h => h.FechaToma)
                .FirstOrDefaultAsync();

            if (lastRecord != null && lastRecord.Id != id)
            {
                return BadRequest("Solo se puede editar el registro más reciente.");
            }

            _context.Entry(historial).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!HistorialMedicoExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/historialmedico/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHistorialMedico(int id)
        {
            var historial = await _context.HistorialMedico.FindAsync(id);
            if (historial == null)
            {
                return NotFound();
            }

            // Validar que sea el último registro
            var lastRecord = await _context.HistorialMedico
                .Where(h => h.AlumnoId == historial.AlumnoId && h.FechaAnulacion == null)
                .OrderByDescending(h => h.FechaToma)
                .FirstOrDefaultAsync();

            if (lastRecord != null && lastRecord.Id != id)
            {
                return BadRequest("Solo se puede eliminar el registro más reciente.");
            }

            _context.HistorialMedico.Remove(historial);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool HistorialMedicoExists(int id)
        {
            return _context.HistorialMedico.Any(e => e.Id == id);
        }
    }
}
