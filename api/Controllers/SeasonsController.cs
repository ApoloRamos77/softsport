using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SeasonsController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public SeasonsController(SoftSportDbContext context)
        {
            _context = context;
        }

        // GET: api/Seasons
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Season>>> GetSeasons()
        {
            // Filtrar temporadas no anuladas
            return await _context.Seasons
                .Where(s => s.FechaAnulacion == null)
                .ToListAsync();
        }

        // GET: api/Seasons/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Season>> GetSeason(int id)
        {
            var season = await _context.Seasons.FindAsync(id);

            if (season == null)
            {
                return NotFound();
            }

            return season;
        }

        // POST: api/Seasons
        [HttpPost]
        public async Task<ActionResult<Season>> PostSeason(Season season)
        {
            // Si la nueva temporada está marcada como activa, desactivar las demás
            if (season.Activo)
            {
                var activeSeasons = await _context.Seasons.Where(s => s.Activo).ToListAsync();
                foreach (var s in activeSeasons)
                {
                    s.Activo = false;
                }
            }

            // Set audit fields
            season.FechaCreacion = DateTime.UtcNow;
            season.UsuarioCreacion = "admin";

            // Convert dates to UTC if provided
            if (season.FechaInicio.HasValue && season.FechaInicio.Value.Kind != DateTimeKind.Utc)
            {
                season.FechaInicio = DateTime.SpecifyKind(season.FechaInicio.Value, DateTimeKind.Utc);
            }
            if (season.FechaFin.HasValue && season.FechaFin.Value.Kind != DateTimeKind.Utc)
            {
                season.FechaFin = DateTime.SpecifyKind(season.FechaFin.Value, DateTimeKind.Utc);
            }

            _context.Seasons.Add(season);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSeason), new { id = season.Id }, season);
        }

        // PUT: api/Seasons/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSeason(int id, Season season)
        {
            if (id != season.Id)
            {
                return BadRequest();
            }

            // Si se está activando esta temporada, desactivar las demás
            if (season.Activo)
            {
                var activeSeasons = await _context.Seasons.Where(s => s.Activo && s.Id != id).ToListAsync();
                foreach (var s in activeSeasons)
                {
                    s.Activo = false;
                }
            }

            // Set audit fields
            season.FechaModificacion = DateTime.UtcNow;
            season.UsuarioModificacion = "admin";

            // Convert dates to UTC if provided
            if (season.FechaInicio.HasValue && season.FechaInicio.Value.Kind != DateTimeKind.Utc)
            {
                season.FechaInicio = DateTime.SpecifyKind(season.FechaInicio.Value, DateTimeKind.Utc);
            }
            if (season.FechaFin.HasValue && season.FechaFin.Value.Kind != DateTimeKind.Utc)
            {
                season.FechaFin = DateTime.SpecifyKind(season.FechaFin.Value, DateTimeKind.Utc);
            }

            _context.Entry(season).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SeasonExists(id))
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

        // DELETE: api/Seasons/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSeason(int id)
        {
            var season = await _context.Seasons.FindAsync(id);
            if (season == null)
            {
                return NotFound();
            }

            _context.Seasons.Remove(season);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SeasonExists(int id)
        {
            return _context.Seasons.Any(e => e.Id == id);
        }
    }
}
