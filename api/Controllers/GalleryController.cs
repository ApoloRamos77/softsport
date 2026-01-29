using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GalleryController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public GalleryController(SoftSportDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LandingGallery>>> GetGalleries()
        {
            return await _context.LandingGalleries
                .Where(g => g.FechaAnulacion == null)
                .OrderByDescending(g => g.Fecha)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LandingGallery>> GetGallery(int id)
        {
            var item = await _context.LandingGalleries.FindAsync(id);
            if (item == null || item.FechaAnulacion != null) return NotFound();
            return item;
        }

        [HttpPost]
        public async Task<ActionResult<LandingGallery>> PostGallery(LandingGallery item)
        {
            _context.LandingGalleries.Add(item);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetGallery), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutGallery(int id, LandingGallery item)
        {
            if (id != item.Id) return BadRequest();
            _context.Entry(item).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.LandingGalleries.Any(e => e.Id == id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGallery(int id)
        {
            var item = await _context.LandingGalleries.FindAsync(id);
            if (item == null) return NotFound();
            
            // Soft delete
            item.FechaAnulacion = DateTime.Now;
            item.UsuarioAnulacion = User.Identity?.Name ?? "System";
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
