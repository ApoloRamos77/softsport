using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BioquimicaController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public BioquimicaController(SoftSportDbContext context)
        {
            _context = context;
        }

        // GET: api/bioquimica/alumno/5
        [HttpGet("alumno/{alumnoId}")]
        public async Task<ActionResult<IEnumerable<Bioquimica>>> GetBioquimicaByAlumno(int alumnoId)
        {
            return await _context.Bioquimica
                .Where(b => b.AlumnoId == alumnoId && b.FechaAnulacion == null)
                .OrderByDescending(b => b.FechaToma)
                .ToListAsync();
        }

        // POST: api/bioquimica
        [HttpPost]
        public async Task<ActionResult<Bioquimica>> PostBioquimica(Bioquimica bioquimica)
        {
            _context.Bioquimica.Add(bioquimica);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetBioquimicaByAlumno", new { alumnoId = bioquimica.AlumnoId }, bioquimica);
        }

        // PUT: api/bioquimica/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBioquimica(int id, Bioquimica bioquimica)
        {
            if (id != bioquimica.Id)
            {
                return BadRequest();
            }

            _context.Entry(bioquimica).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BioquimicaExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/bioquimica/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBioquimica(int id)
        {
            var bioquimica = await _context.Bioquimica.FindAsync(id);
            if (bioquimica == null)
            {
                return NotFound();
            }

            _context.Bioquimica.Remove(bioquimica);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BioquimicaExists(int id)
        {
            return _context.Bioquimica.Any(e => e.Id == id);
        }
    }
}
