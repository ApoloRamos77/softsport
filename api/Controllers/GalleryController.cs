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
            
            // Get existing item to check for image URL change
            var existingItem = await _context.LandingGalleries.AsNoTracking().FirstOrDefaultAsync(g => g.Id == id);
            if (existingItem == null) return NotFound();
            
            // Delete old image if URL changed
            if (!string.IsNullOrEmpty(existingItem.ImageUrl) && 
                existingItem.ImageUrl != item.ImageUrl)
            {
                DeleteImageFile(existingItem.ImageUrl);
            }
            
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
            
            // Store image URL for deletion
            var imageUrl = item.ImageUrl;
            
            // Soft delete
            item.FechaAnulacion = DateTime.Now;
            item.UsuarioAnulacion = User.Identity?.Name ?? "System";
            await _context.SaveChangesAsync();
            
            // Delete physical file
            if (!string.IsNullOrEmpty(imageUrl))
            {
                DeleteImageFile(imageUrl);
            }
            
            return NoContent();
        }
        
        /// <summary>
        /// Helper method to delete image files from the server
        /// </summary>
        private void DeleteImageFile(string fileUrl)
        {
            try
            {
                // Extract file path from URL
                // URL format: http://localhost:5081/uploads/gallery/abc123.jpg
                var uri = new Uri(fileUrl);
                var relativePath = uri.AbsolutePath.TrimStart('/');
                
                var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var filePath = Path.Combine(webRootPath, relativePath);
                
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                    Console.WriteLine($"[GALLERY] Deleted old image: {filePath}");
                }
                else
                {
                    Console.WriteLine($"[GALLERY] Image file not found for deletion: {filePath}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GALLERY] Error deleting image file: {ex.Message}");
                // Don't throw - we don't want file deletion errors to break the API
            }
        }
    }
}
