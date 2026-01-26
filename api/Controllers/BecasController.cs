using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BecasController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public BecasController(SoftSportDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Beca>>> GetBecas()
        {
            return await _context.Becas.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Beca>> GetBeca(int id)
        {
            var beca = await _context.Becas.FindAsync(id);
            if (beca == null)
            {
                return NotFound();
            }
            return beca;
        }

        [HttpPost]
        public async Task<ActionResult<Beca>> PostBeca(Beca beca)
        {
            _context.Becas.Add(beca);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetBeca), new { id = beca.Id }, beca);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutBeca(int id, Beca beca)
        {
            if (id != beca.Id)
            {
                return BadRequest();
            }

            _context.Entry(beca).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Becas.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBeca(int id)
        {
            var beca = await _context.Becas.FindAsync(id);
            if (beca == null)
            {
                return NotFound();
            }

            _context.Becas.Remove(beca);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
