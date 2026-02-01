using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AlumnosController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public AlumnosController(SoftSportDbContext context)
        {
            _context = context;
        }

        // GET: api/alumnos
        [HttpGet]
        public async Task<ActionResult<object>> GetAlumnos(
            int page = 1, 
            int pageSize = 20, 
            string? searchTerm = null,
            string? estado = null,
            int? grupoId = null,
            int? categoriaId = null)
        {
            var query = _context.Alumnos
                .Include(a => a.Representante)
                .Include(a => a.Grupo)
                .Include(a => a.Categoria)
                .Include(a => a.Beca)
                .AsQueryable();

            // Filtrar por término de búsqueda (Nombre, Apellido o Documento)
            if (!string.IsNullOrEmpty(searchTerm))
            {
                var lowerSearch = searchTerm.ToLower();
                query = query.Where(a => 
                    a.Nombre.ToLower().Contains(lowerSearch) || 
                    a.Apellido.ToLower().Contains(lowerSearch) || 
                    a.Documento.ToLower().Contains(lowerSearch));
            }

            // Filtrar por estado
            if (!string.IsNullOrEmpty(estado))
            {
                if (estado == "Activo")
                {
                    query = query.Where(a => a.FechaAnulacion == null);
                }
                else if (estado == "Inactivo")
                {
                    query = query.Where(a => a.FechaAnulacion != null);
                }
            }

            // Filtrar por grupo
            if (grupoId.HasValue && grupoId > 0)
            {
                query = query.Where(a => a.GrupoId == grupoId);
            }

            // Filtrar por categoría
            if (categoriaId.HasValue && categoriaId > 0)
            {
                query = query.Where(a => a.CategoriaId == categoriaId);
            }

            var totalCount = await query.CountAsync();

            var alumnos = await query
                .OrderBy(a => a.Nombre)
                .ThenBy(a => a.Apellido)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                totalCount = totalCount,
                data = alumnos
            });
        }

        // GET: api/alumnos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Alumno>> GetAlumno(int id)
        {
            var alumno = await _context.Alumnos
                .Include(a => a.Representante)
                .Include(a => a.Grupo)
                .Include(a => a.Categoria)
                .Include(a => a.Beca)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (alumno == null)
            {
                return NotFound();
            }

            return alumno;
        }

        // POST: api/alumnos
        [HttpPost]
        public async Task<ActionResult<Alumno>> PostAlumno(Alumno alumno)
        {
            _context.Alumnos.Add(alumno);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAlumno), new { id = alumno.Id }, alumno);
        }

        // PUT: api/alumnos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAlumno(int id, Alumno alumno)
        {
            if (id != alumno.Id)
            {
                return BadRequest();
            }

            _context.Entry(alumno).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AlumnoExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/alumnos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAlumno(int id)
        {
            var alumno = await _context.Alumnos.FindAsync(id);
            if (alumno == null)
            {
                return NotFound();
            }

            _context.Alumnos.Remove(alumno);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AlumnoExists(int id)
        {
            return _context.Alumnos.Any(e => e.Id == id);
        }
    }
}
