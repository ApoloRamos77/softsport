using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    public class PaymentMethodDto
    {
        public string nombre { get; set; } = string.Empty;
        public string? descripcion { get; set; }
        public string? moneda { get; set; }
        public string estado { get; set; } = "Activo";
    }

    [Route("api/[controller]")]
    [ApiController]
    public class PaymentMethodsController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public PaymentMethodsController(SoftSportDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetPaymentMethods(int page = 1, int pageSize = 20)
        {
            var query = _context.PaymentMethods.AsQueryable();
            var methods = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            return Ok(methods.Select(m => new
            {
                m.Id,
                m.Nombre,
                m.Descripcion,
                Moneda = m.Currency,
                Estado = m.Activo ? "Activo" : "Inactivo"
            }));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentMethod>> GetPaymentMethod(int id)
        {
            var method = await _context.PaymentMethods.FindAsync(id);
            if (method == null)
            {
                return NotFound();
            }
            return method;
        }

        [HttpPost]
        public async Task<ActionResult<object>> PostPaymentMethod([FromBody] PaymentMethodDto data)
        {
            var method = new PaymentMethod
            {
                Nombre = data.nombre ?? "",
                Descripcion = data.descripcion,
                Currency = data.moneda,
                Activo = data.estado == "Activo"
            };
            
            _context.PaymentMethods.Add(method);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetPaymentMethod), new { id = method.Id }, new
            {
                method.Id,
                method.Nombre,
                method.Descripcion,
                Moneda = method.Currency,
                Estado = method.Activo ? "Activo" : "Inactivo"
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPaymentMethod(int id, [FromBody] PaymentMethodDto data)
        {
            var method = await _context.PaymentMethods.FindAsync(id);
            if (method == null)
            {
                return NotFound();
            }

            method.Nombre = data.nombre ?? method.Nombre;
            method.Descripcion = data.descripcion;
            method.Currency = data.moneda;
            method.Activo = data.estado == "Activo";

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.PaymentMethods.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePaymentMethod(int id)
        {
            var method = await _context.PaymentMethods.FindAsync(id);
            if (method == null)
            {
                return NotFound();
            }

            _context.PaymentMethods.Remove(method);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
