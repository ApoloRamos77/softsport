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
        public async Task<ActionResult<object>> GetRepresentantes(
            int page = 1, 
            int pageSize = 20, 
            string? searchTerm = null)
        {
            var query = _context.Representantes.AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                var lowerSearch = searchTerm.ToLower();
                query = query.Where(r => 
                    r.Nombre.ToLower().Contains(lowerSearch) || 
                    r.Apellido.ToLower().Contains(lowerSearch) || 
                    (r.Documento != null && r.Documento.ToLower().Contains(lowerSearch)));
            }

            var totalCount = await query.CountAsync();

            var representantes = await query
                .OrderBy(r => r.Nombre)
                .ThenBy(r => r.Apellido)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new
                {
                    r.Id,
                    r.Nombre,
                    r.Apellido,
                    r.Documento,
                    r.Email,
                    r.Telefono,
                    r.Parentesco,
                    r.Direccion,
                    r.FechaCreacion,
                    r.FechaAnulacion,
                    AlumnosCount = r.Alumnos.Count(a => a.FechaAnulacion == null)
                })
                .ToListAsync();

            return Ok(new
            {
                totalCount = totalCount,
                data = representantes
            });
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
