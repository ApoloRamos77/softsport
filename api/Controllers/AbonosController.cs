using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AbonosController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public AbonosController(SoftSportDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAbonos(int page = 1, int pageSize = 20)
        {
            var query = _context.Abonos
                .Include(a => a.Recibo)
                    .ThenInclude(r => r.Alumno)
                .Include(a => a.Recibo)
                    .ThenInclude(r => r.Items)
                .AsQueryable();

            var abonos = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(abonos.Select(a => new
            {
                a.Id,
                a.ReciboId,
                a.Monto,
                a.Fecha,
                a.PaymentMethodId,
                a.Referencia,
                Recibo = a.Recibo == null ? null : new
                {
                    a.Recibo.Id,
                    Alumno = a.Recibo.Alumno == null ? null : new
                    {
                        a.Recibo.Alumno.Nombre,
                        a.Recibo.Alumno.Apellido
                    },
                    Items = a.Recibo.Items.Select(i => new
                    {
                        i.Id,
                        i.Tipo,
                        i.ItemId,
                        i.Descripcion,
                        i.Cantidad,
                        i.PrecioUnitario,
                        i.Total
                    }).ToList()
                }
            }));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Abono>> GetAbono(int id)
        {
            var abono = await _context.Abonos.FindAsync(id);

            if (abono == null)
            {
                return NotFound();
            }

            return abono;
        }

        [HttpPost]
        public async Task<ActionResult<Abono>> PostAbono(Abono abono)
        {
            _context.Abonos.Add(abono);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAbono), new { id = abono.Id }, abono);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutAbono(int id, Abono abono)
        {
            if (id != abono.Id)
            {
                return BadRequest();
            }

            _context.Entry(abono).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AbonoExists(id))
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
        public async Task<IActionResult> DeleteAbono(int id)
        {
            var abono = await _context.Abonos.FindAsync(id);
            if (abono == null)
            {
                return NotFound();
            }

            _context.Abonos.Remove(abono);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AbonoExists(int id)
        {
            return _context.Abonos.Any(e => e.Id == id);
        }
    }
}
