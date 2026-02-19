using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PeriodosPagoController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public PeriodosPagoController(SoftSportDbContext context)
        {
            _context = context;
        }

        // GET: api/periodospago
        [HttpGet]
        public async Task<ActionResult<object>> GetPeriodosPago(
            int page = 1,
            int pageSize = 50,
            int? alumnoId = null,
            string? estado = null,
            int? anio = null,
            int? mes = null)
        {
            var query = _context.PeriodosPago
                .Include(p => p.Alumno)
                .Include(p => p.Recibo)
                .AsQueryable();

            if (alumnoId.HasValue)
                query = query.Where(p => p.AlumnoId == alumnoId.Value);

            if (!string.IsNullOrEmpty(estado))
                query = query.Where(p => p.Estado == estado);

            if (anio.HasValue)
                query = query.Where(p => p.Anio == anio.Value);

            if (mes.HasValue)
                query = query.Where(p => p.Mes == mes.Value);

            var totalCount = await query.CountAsync();

            var periodos = await query
                .OrderByDescending(p => p.Anio)
                .ThenByDescending(p => p.Mes)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var data = periodos.Select(p => MapPeriodo(p)).ToList();

            return Ok(new { totalCount, data });
        }

        // GET: api/periodospago/alumno/{alumnoId}
        [HttpGet("alumno/{alumnoId}")]
        public async Task<ActionResult<object>> GetPeriodosByAlumno(int alumnoId)
        {
            var periodos = await _context.PeriodosPago
                .Include(p => p.Alumno)
                .Include(p => p.Recibo)
                .Where(p => p.AlumnoId == alumnoId)
                .OrderBy(p => p.Anio)
                .ThenBy(p => p.Mes)
                .ToListAsync();

            return Ok(periodos.Select(p => MapPeriodo(p)).ToList());
        }

        // GET: api/periodospago/vencidos
        [HttpGet("vencidos")]
        public async Task<ActionResult<object>> GetPeriodosVencidos()
        {
            var hoy = DateTime.Today;

            // Auto-update: mark Pendiente periods past due date as Vencido
            var pendientesVencidos = await _context.PeriodosPago
                .Where(p => p.Estado == "Pendiente" && p.FechaVencimiento.HasValue && p.FechaVencimiento.Value < hoy)
                .ToListAsync();

            foreach (var p in pendientesVencidos)
            {
                p.Estado = "Vencido";
                p.FechaModificacion = DateTime.UtcNow;
            }

            if (pendientesVencidos.Any())
                await _context.SaveChangesAsync();

            var vencidos = await _context.PeriodosPago
                .Include(p => p.Alumno)
                .Where(p => p.Estado == "Vencido")
                .OrderBy(p => p.Anio)
                .ThenBy(p => p.Mes)
                .ToListAsync();

            return Ok(new
            {
                totalCount = vencidos.Count,
                data = vencidos.Select(p => MapPeriodo(p)).ToList()
            });
        }

        // GET: api/periodospago/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetPeriodoPago(int id)
        {
            var periodo = await _context.PeriodosPago
                .Include(p => p.Alumno)
                .Include(p => p.Recibo)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (periodo == null) return NotFound();

            return Ok(MapPeriodo(periodo));
        }

        // POST: api/periodospago
        [HttpPost]
        public async Task<ActionResult<object>> PostPeriodoPago(PeriodoPago periodo)
        {
            // Check for duplicate
            var exists = await _context.PeriodosPago
                .AnyAsync(p => p.AlumnoId == periodo.AlumnoId && p.Anio == periodo.Anio && p.Mes == periodo.Mes);

            if (exists)
                return Conflict(new { error = $"Ya existe un período para el mes {periodo.Mes}/{periodo.Anio} de este alumno." });

            periodo.FechaCreacion = DateTime.UtcNow;
            periodo.UsuarioCreacion = "System";

            _context.PeriodosPago.Add(periodo);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPeriodoPago), new { id = periodo.Id }, MapPeriodo(periodo));
        }

        // POST: api/periodospago/generar/{alumnoId}
        [HttpPost("generar/{alumnoId}")]
        public async Task<ActionResult<object>> GenerarPeriodos(int alumnoId, [FromBody] GenerarPeriodosRequest? request = null)
        {
            var alumno = await _context.Alumnos.FindAsync(alumnoId);
            if (alumno == null) return NotFound(new { error = "Alumno no encontrado" });

            // Use fechaInscripcion if available, otherwise fechaRegistro
            var fechaInicio = alumno.FechaInscripcion ?? alumno.FechaRegistro;
            var fechaHasta = request?.FechaHasta ?? DateTime.Today;
            var montoMensual = request?.MontoMensual ?? 0;
            var diaVencimiento = request?.DiaVencimiento ?? 10; // default: day 10 of each month

            // Get existing periods for this student
            var existentes = await _context.PeriodosPago
                .Where(p => p.AlumnoId == alumnoId)
                .Select(p => new { p.Anio, p.Mes })
                .ToListAsync();

            var nuevos = new List<PeriodoPago>();
            var current = new DateTime(fechaInicio.Year, fechaInicio.Month, 1);
            var hasta = new DateTime(fechaHasta.Year, fechaHasta.Month, 1);

            while (current <= hasta)
            {
                var anio = current.Year;
                var mes = current.Month;

                if (!existentes.Any(e => e.Anio == anio && e.Mes == mes))
                {
                    var fechaVencimiento = new DateTime(anio, mes, Math.Min(diaVencimiento, DateTime.DaysInMonth(anio, mes)));
                    var estadoInicial = fechaVencimiento < DateTime.Today ? "Vencido" : "Pendiente";

                    nuevos.Add(new PeriodoPago
                    {
                        AlumnoId = alumnoId,
                        Anio = anio,
                        Mes = mes,
                        FechaVencimiento = fechaVencimiento,
                        Monto = montoMensual,
                        Estado = estadoInicial,
                        FechaCreacion = DateTime.UtcNow,
                        UsuarioCreacion = "System"
                    });
                }

                current = current.AddMonths(1);
            }

            if (nuevos.Any())
            {
                _context.PeriodosPago.AddRange(nuevos);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                message = $"Se generaron {nuevos.Count} período(s) para {alumno.Nombre} {alumno.Apellido}.",
                generados = nuevos.Count,
                existentes = existentes.Count
            });
        }

        // POST: api/periodospago/generar-todos
        [HttpPost("generar-todos")]
        public async Task<ActionResult<object>> GenerarPeriodosTodos([FromBody] GenerarPeriodosRequest? request = null)
        {
            var fechaHasta = request?.FechaHasta ?? DateTime.Today;
            var montoMensual = request?.MontoMensual ?? 0;
            var diaVencimiento = request?.DiaVencimiento ?? 10;

            // Get all active students with an enrollment date
            var alumnos = await _context.Alumnos
                .Where(a => a.Estado == "Activo" || a.Estado == null)
                .ToListAsync();

            var totalGenerados = 0;
            var totalAlumnos = 0;
            var errores = new List<string>();

            // Get ALL existing periods at once for efficiency
            var todosExistentes = await _context.PeriodosPago
                .Select(p => new { p.AlumnoId, p.Anio, p.Mes })
                .ToListAsync();

            var nuevos = new List<PeriodoPago>();

            foreach (var alumno in alumnos)
            {
                var fechaInicio = alumno.FechaInscripcion ?? alumno.FechaRegistro;

                var existentesAlumno = todosExistentes
                    .Where(e => e.AlumnoId == alumno.Id)
                    .Select(e => new { e.Anio, e.Mes })
                    .ToList();

                var current = new DateTime(fechaInicio.Year, fechaInicio.Month, 1);
                var hasta = new DateTime(fechaHasta.Year, fechaHasta.Month, 1);
                var generadosAlumno = 0;

                while (current <= hasta)
                {
                    var anio = current.Year;
                    var mes = current.Month;

                    if (!existentesAlumno.Any(e => e.Anio == anio && e.Mes == mes))
                    {
                        var fechaVencimiento = new DateTime(anio, mes, Math.Min(diaVencimiento, DateTime.DaysInMonth(anio, mes)));
                        var estadoInicial = fechaVencimiento < DateTime.Today ? "Vencido" : "Pendiente";

                        nuevos.Add(new PeriodoPago
                        {
                            AlumnoId = alumno.Id,
                            Anio = anio,
                            Mes = mes,
                            FechaVencimiento = fechaVencimiento,
                            Monto = montoMensual,
                            Estado = estadoInicial,
                            FechaCreacion = DateTime.UtcNow,
                            UsuarioCreacion = "System"
                        });
                        generadosAlumno++;
                    }

                    current = current.AddMonths(1);
                }

                if (generadosAlumno > 0) totalAlumnos++;
                totalGenerados += generadosAlumno;
            }

            if (nuevos.Any())
            {
                _context.PeriodosPago.AddRange(nuevos);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                message = $"Se generaron {totalGenerados} período(s) para {totalAlumnos} alumno(s).",
                totalGenerados,
                totalAlumnos,
                totalAlumnosProcesados = alumnos.Count
            });
        }

        // PUT: api/periodospago/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPeriodoPago(int id, PeriodoPago periodo)
        {
            if (id != periodo.Id) return BadRequest();

            var existing = await _context.PeriodosPago.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Estado = periodo.Estado;
            existing.Monto = periodo.Monto;
            existing.FechaInicio = periodo.FechaInicio;
            existing.FechaVencimiento = periodo.FechaVencimiento;
            existing.ReciboId = periodo.ReciboId;
            existing.Observaciones = periodo.Observaciones;
            existing.FechaModificacion = DateTime.UtcNow;
            existing.UsuarioModificacion = "System";

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: api/periodospago/{id}/pagar
        [HttpPut("{id}/pagar")]
        public async Task<IActionResult> MarcarPagado(int id, [FromBody] MarcarPagadoRequest req)
        {
            var periodo = await _context.PeriodosPago.FindAsync(id);
            if (periodo == null) return NotFound();

            periodo.Estado = "Pagado";
            periodo.ReciboId = req.ReciboId;
            periodo.FechaModificacion = DateTime.UtcNow;
            periodo.UsuarioModificacion = "System";

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/periodospago/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePeriodoPago(int id)
        {
            var periodo = await _context.PeriodosPago.FindAsync(id);
            if (periodo == null) return NotFound();

            _context.PeriodosPago.Remove(periodo);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static object MapPeriodo(PeriodoPago p)
        {
            return new
            {
                p.Id,
                p.AlumnoId,
                AlumnoNombre = p.Alumno != null ? $"{p.Alumno.Nombre} {p.Alumno.Apellido}" : null,
                p.Anio,
                p.Mes,
                p.FechaInicio,
                p.FechaVencimiento,
                p.Monto,
                p.Estado,
                p.ReciboId,
                ReciboNumero = p.Recibo?.Numero,
                p.Observaciones,
                p.FechaCreacion,
                p.FechaModificacion
            };
        }
    }

    public class GenerarPeriodosRequest
    {
        public DateTime? FechaHasta { get; set; }
        public decimal MontoMensual { get; set; } = 0;
        public int DiaVencimiento { get; set; } = 10;
    }

    public class MarcarPagadoRequest
    {
        public int? ReciboId { get; set; }
    }
}
