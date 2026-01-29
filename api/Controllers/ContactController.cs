using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public ContactController(SoftSportDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ContactMessage>>> GetMessages()
        {
            return await _context.ContactMessages
                .Where(m => m.FechaAnulacion == null)
                .OrderByDescending(m => m.FechaCreacion)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<ContactMessage>> PostMessage(ContactMessage message)
        {
            _context.ContactMessages.Add(message);
            await _context.SaveChangesAsync();
            return Ok(message);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            var message = await _context.ContactMessages.FindAsync(id);
            if (message == null) return NotFound();
            
            _context.ContactMessages.Remove(message);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
