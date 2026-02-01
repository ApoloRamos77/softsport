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
        public async Task<ActionResult<object>> GetAbonos(
            int page = 1, 
            int pageSize = 20, 
            string? searchTerm = null,
            int? paymentMethodId = null,
            DateTime? desde = null,
            DateTime? hasta = null)
        {
            var query = _context.Abonos
                .Include(a => a.Recibo)
                    .ThenInclude(r => r.Alumno)
                .Include(a => a.Recibo)
                    .ThenInclude(r => r.Items)
                .AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                var lowerSearch = searchTerm.ToLower();
                query = query.Where(a => 
                    a.ReciboId.ToString().Contains(searchTerm) ||
                    (a.Recibo != null && a.Recibo.Alumno != null && (a.Recibo.Alumno.Nombre.ToLower().Contains(lowerSearch) || a.Recibo.Alumno.Apellido.ToLower().Contains(lowerSearch))) ||
                    (a.Referencia != null && a.Referencia.ToLower().Contains(lowerSearch)));
            }

            if (paymentMethodId.HasValue && paymentMethodId.Value > 0)
            {
                query = query.Where(a => a.PaymentMethodId == paymentMethodId.Value);
            }

            if (desde.HasValue)
            {
                var d = desde.Value.Date;
                query = query.Where(a => a.Fecha >= d);
            }

            if (hasta.HasValue)
            {
                var h = hasta.Value.Date.AddDays(1).AddTicks(-1);
                query = query.Where(a => a.Fecha <= h);
            }

            var totalCount = await query.CountAsync();

            var abonos = await query
                .OrderByDescending(a => a.Fecha)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var data = abonos.Select(a => new
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
            });

            return Ok(new
            {
                totalCount = totalCount,
                data = data
            });
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
