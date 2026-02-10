using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PersonalController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public PersonalController(SoftSportDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Personal>>> GetPersonal(
            [FromQuery] string? cargo = null,
            [FromQuery] string? estado = "Activo")
        {
            var query = _context.Personal.AsQueryable();

            if (!string.IsNullOrEmpty(cargo))
            {
                query = query.Where(p => p.Cargo == cargo);
            }

            if (!string.IsNullOrEmpty(estado))
            {
                query = query.Where(p => p.Estado == estado);
            }

            return await query.OrderBy(p => p.Apellidos).ThenBy(p => p.Nombres).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Personal>> GetPersonal(int id)
        {
            var personal = await _context.Personal.FindAsync(id);

            if (personal == null)
            {
                return NotFound();
            }

            return personal;
        }

        [HttpPost]
        public async Task<ActionResult<Personal>> PostPersonal(Personal personal)
        {
            _context.Personal.Add(personal);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPersonal", new { id = personal.Id }, personal);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPersonal(int id, Personal personal)
        {
            if (id != personal.Id)
            {
                return BadRequest();
            }

            _context.Entry(personal).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PersonalExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePersonal(int id)
        {
            var personal = await _context.Personal.FindAsync(id);
            if (personal == null)
            {
                return NotFound();
            }

            // Soft delete
            personal.Estado = "Inactivo";
            // personal.FechaAnulacion = DateTime.UtcNow; // If you want to use audit fields fully

            _context.Entry(personal).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PersonalExists(int id)
        {
            return _context.Personal.Any(e => e.Id == id);
        }
    }
}
