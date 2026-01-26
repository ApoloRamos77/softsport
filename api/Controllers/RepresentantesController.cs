using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RepresentantesController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public RepresentantesController(SoftSportDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Representante>>> GetRepresentantes()
        {
            return await _context.Representantes.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Representante>> GetRepresentante(int id)
        {
            var representante = await _context.Representantes.FindAsync(id);
            if (representante == null)
            {
                return NotFound();
            }
            return representante;
        }

        [HttpPost]
        public async Task<ActionResult<Representante>> PostRepresentante(Representante representante)
        {
            // Set audit fields
            representante.FechaCreacion = DateTime.UtcNow;
            representante.UsuarioCreacion = "admin";

            _context.Representantes.Add(representante);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetRepresentante), new { id = representante.Id }, representante);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutRepresentante(int id, Representante representante)
        {
            if (id != representante.Id)
            {
                return BadRequest();
            }

            // Set audit fields
            representante.FechaModificacion = DateTime.UtcNow;
            representante.UsuarioModificacion = "admin";

            _context.Entry(representante).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Representantes.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRepresentante(int id)
        {
            var representante = await _context.Representantes.FindAsync(id);
            if (representante == null)
            {
                return NotFound();
            }

            _context.Representantes.Remove(representante);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
