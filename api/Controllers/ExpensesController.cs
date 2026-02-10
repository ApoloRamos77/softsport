using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExpensesController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public ExpensesController(SoftSportDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetExpenses(
            int page = 1, 
            int pageSize = 20, 
            string? searchTerm = null,
            DateTime? desde = null,
            DateTime? hasta = null)
        {
            var query = _context.Expenses.AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                var lowerSearch = searchTerm.ToLower();
                query = query.Where(e => e.Descripcion.ToLower().Contains(lowerSearch));
            }

            if (desde.HasValue)
            {
                query = query.Where(e => e.Fecha >= desde.Value);
            }

            if (hasta.HasValue)
            {
                var fechaHasta = hasta.Value.Date.AddDays(1);
                query = query.Where(e => e.Fecha < fechaHasta);
            }

            var totalCount = await query.CountAsync();
            var totalMonto = await query.SumAsync(e => e.Monto);

            var expenses = await query
                .OrderByDescending(e => e.Fecha)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                totalCount = totalCount,
                totalMonto = totalMonto,
                data = expenses
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Expense>> GetExpense(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);

            if (expense == null)
            {
                return NotFound();
            }

            return expense;
        }

        [HttpPost]
        public async Task<ActionResult<Expense>> PostExpense(Expense expense)
        {
            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, expense);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutExpense(int id, Expense expense)
        {
            if (id != expense.Id)
            {
                return BadRequest();
            }

            _context.Entry(expense).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ExpenseExists(id))
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
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
            {
                return NotFound();
            }

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ExpenseExists(int id)
        {
            return _context.Expenses.Any(e => e.Id == id);
        }
    }
}
