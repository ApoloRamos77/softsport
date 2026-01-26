using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TacticalBoardsController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public TacticalBoardsController(SoftSportDbContext context)
        {
            _context = context;
        }

        // GET: api/TacticalBoards
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TacticalBoard>>> GetTacticalBoards()
        {
            return await _context.TacticalBoards.OrderByDescending(t => t.CreatedAt).ToListAsync();
        }

        // GET: api/TacticalBoards/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TacticalBoard>> GetTacticalBoard(int id)
        {
            var tacticalBoard = await _context.TacticalBoards.FindAsync(id);

            if (tacticalBoard == null)
            {
                return NotFound();
            }

            return tacticalBoard;
        }

        // PUT: api/TacticalBoards/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTacticalBoard(int id, TacticalBoard tacticalBoard)
        {
            if (id != tacticalBoard.Id)
            {
                return BadRequest();
            }

            _context.Entry(tacticalBoard).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TacticalBoardExists(id))
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

        // POST: api/TacticalBoards
        [HttpPost]
        public async Task<ActionResult<TacticalBoard>> PostTacticalBoard(TacticalBoard tacticalBoard)
        {
            _context.TacticalBoards.Add(tacticalBoard);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTacticalBoard", new { id = tacticalBoard.Id }, tacticalBoard);
        }

        // DELETE: api/TacticalBoards/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTacticalBoard(int id)
        {
            var tacticalBoard = await _context.TacticalBoards.FindAsync(id);
            if (tacticalBoard == null)
            {
                return NotFound();
            }

            _context.TacticalBoards.Remove(tacticalBoard);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TacticalBoardExists(int id)
        {
            return _context.TacticalBoards.Any(e => e.Id == id);
        }
    }
}
