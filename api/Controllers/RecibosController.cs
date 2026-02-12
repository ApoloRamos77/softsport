using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecibosController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public RecibosController(SoftSportDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetRecibos(
            int page = 1, 
            int pageSize = 20, 
            string? searchTerm = null,
            DateTime? desde = null,
            DateTime? hasta = null)
        {
            var query = _context.Recibos
                .Include(r => r.Items)
                .Include(r => r.Abonos)
                .Include(r => r.Alumno)
                .AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                var lowerSearch = searchTerm.ToLower();
                query = query.Where(r => 
                    r.Numero.ToLower().Contains(lowerSearch) || 
                    (r.Alumno != null && (r.Alumno.Nombre.ToLower().Contains(lowerSearch) || r.Alumno.Apellido.ToLower().Contains(lowerSearch))));
            }

            if (desde.HasValue)
            {
                query = query.Where(r => r.Fecha >= desde.Value);
            }

            if (hasta.HasValue)
            {
                var fechaHasta = hasta.Value.Date.AddDays(1);
                query = query.Where(r => r.Fecha < fechaHasta);
            }

            var totalCount = await query.CountAsync();

            var stats = new
            {
                montoFacturado = await query.SumAsync(r => r.Subtotal),
                montoRecaudado = await query.Where(r => r.Estado == "Pagado").SumAsync(r => r.Total),
                montoExonerado = await query.SumAsync(r => r.Descuento),
                montoPorRecaudar = await query.Where(r => r.Estado == "Pendiente").SumAsync(r => r.Total)
            };

            var servicios = await _context.Servicios.ToDictionaryAsync(s => s.Id, s => s.Nombre);
            var productos = await _context.Productos.ToDictionaryAsync(p => p.Id, p => p.Nombre);

            var recibos = await query
                .OrderByDescending(r => r.Fecha)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var data = recibos.Select(r => new
            {
                r.Id,
                r.Numero,
                r.DestinatarioType,
                r.DestinatarioId,
                r.Fecha,
                r.Subtotal,
                r.Descuento,
                r.Total,
                r.Estado,
                AlumnoNombre = r.Alumno != null ? $"{r.Alumno.Nombre} {r.Alumno.Apellido}" : null,
                Items = r.Items.Select(item => new
                {
                    item.Id,
                    item.Tipo,
                    item.ItemId,
                    item.Descripcion,
                    Nombre = item.ItemId.HasValue && item.Tipo == "servicio" && servicios.ContainsKey(item.ItemId.Value)
                        ? servicios[item.ItemId.Value]
                        : item.ItemId.HasValue && item.Tipo == "producto" && productos.ContainsKey(item.ItemId.Value)
                        ? productos[item.ItemId.Value]
                        : item.Descripcion,
                    item.Cantidad,
                    item.PrecioUnitario,
                    item.Total
                }).ToList(),
                Abonos = r.Abonos
            }).ToList();

            return Ok(new
            {
                totalCount = totalCount,
                stats = stats,
                data = data
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetRecibo(int id)
        {
            var recibo = await _context.Recibos
                .Include(r => r.Items)
                .Include(r => r.Abonos)
                .Include(r => r.Alumno)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (recibo == null)
            {
                return NotFound();
            }

            var servicios = await _context.Servicios.ToDictionaryAsync(s => s.Id, s => s.Nombre);
            var productos = await _context.Productos.ToDictionaryAsync(p => p.Id, p => p.Nombre);

            return new
            {
                recibo.Id,
                recibo.Numero,
                recibo.DestinatarioType,
                recibo.DestinatarioId,
                recibo.Fecha,
                recibo.Subtotal,
                recibo.Descuento,
                recibo.Total,
                recibo.Estado,
                Items = recibo.Items.Select(item => new
                {
                    item.Id,
                    item.Tipo,
                    item.ItemId,
                    item.Descripcion,
                    Nombre = item.ItemId.HasValue && item.Tipo == "servicio" && servicios.ContainsKey(item.ItemId.Value)
                        ? servicios[item.ItemId.Value]
                        : item.ItemId.HasValue && item.Tipo == "producto" && productos.ContainsKey(item.ItemId.Value)
                        ? productos[item.ItemId.Value]
                        : item.Descripcion,
                    item.Cantidad,
                    item.PrecioUnitario,
                    item.Total
                }).ToList(),
                recibo.Abonos
            };
        }

        [HttpPost]
        public async Task<ActionResult<Recibo>> PostRecibo(Recibo recibo)
        {
            recibo.FechaCreacion = DateTime.UtcNow;
            recibo.UsuarioCreacion = "System"; // TODO: Replace with logged in user when Auth is ready

            _context.Recibos.Add(recibo);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetRecibo), new { id = recibo.Id }, recibo);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutRecibo(int id, Recibo recibo)
        {
            if (id != recibo.Id)
            {
                return BadRequest("El ID del recibo no coincide");
            }

            var existingRecibo = await _context.Recibos
                .Include(r => r.Items)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (existingRecibo == null)
            {
                return NotFound();
            }

            // Actualizar propiedades del recibo
            existingRecibo.DestinatarioType = recibo.DestinatarioType;
            existingRecibo.DestinatarioId = recibo.DestinatarioId;
            existingRecibo.Fecha = recibo.Fecha;
            existingRecibo.Subtotal = recibo.Subtotal;
            existingRecibo.Descuento = recibo.Descuento;
            existingRecibo.Total = recibo.Total;

            // Handle Annulment
            if (existingRecibo.Estado != "Anulado" && recibo.Estado == "Anulado")
            {
                existingRecibo.FechaAnulacion = DateTime.UtcNow;
                existingRecibo.UsuarioAnulacion = "System";
            }

            existingRecibo.Estado = recibo.Estado;

            existingRecibo.FechaModificacion = DateTime.UtcNow;
            existingRecibo.UsuarioModificacion = "System";

            // Eliminar items antiguos
            _context.ReciboItems.RemoveRange(existingRecibo.Items);

            // Agregar nuevos items
            if (recibo.Items != null && recibo.Items.Any())
            {
                foreach (var item in recibo.Items)
                {
                    existingRecibo.Items.Add(new ReciboItem
                    {
                        Tipo = item.Tipo,
                        ItemId = item.ItemId,
                        Descripcion = item.Descripcion,
                        Cantidad = item.Cantidad,
                        PrecioUnitario = item.PrecioUnitario,
                        Total = item.Total
                    });
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Recibos.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRecibo(int id)
        {
            var recibo = await _context.Recibos.FindAsync(id);
            if (recibo == null)
            {
                return NotFound();
            }

            _context.Recibos.Remove(recibo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("fix-student-assignments")]
        public async Task<IActionResult> FixStudentAssignments()
        {
            try
            {
                // Obtener el primer alumno disponible
                var primerAlumno = await _context.Alumnos.FirstOrDefaultAsync();
                if (primerAlumno == null)
                {
                    return BadRequest("No hay alumnos disponibles");
                }

                // Actualizar recibos sin destinatario_id asignado
                await _context.Database.ExecuteSqlRawAsync(
                    "UPDATE recibos SET destinatario_type = 'alumnos', destinatario_id = {0} WHERE destinatario_id IS NULL OR destinatario_type IS NULL OR destinatario_type = ''",
                    primerAlumno.Id
                );

                return Ok(new { message = "Recibos actualizados exitosamente", alumnoId = primerAlumno.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
