using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;

namespace SoftSportAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public DashboardController(SoftSportDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetStats([FromQuery] int? seasonId = null)
        {
            try
            {
                // Contar alumnos
                var totalAlumnos = await _context.Alumnos.CountAsync();
                var alumnosActivos = await _context.Alumnos.CountAsync(a => a.Estado == "Activo");

                // Contar representantes
                var totalRepresentantes = await _context.Representantes.CountAsync();

                // Contar partidos jugados
                var partidosJugados = 0;
                try
                {
                    partidosJugados = await _context.Games
                        .Where(g => g.Fecha.HasValue && g.Fecha.Value < DateTime.UtcNow)
                        .CountAsync();
                }
                catch
                {
                    // Si la tabla no existe, dejamos en 0
                }

                // Contar entrenamientos (si existe tabla trainings)
                // Por ahora dejamos en 0
                var entrenamientos = 0;

                // Cálculos financieros
                var recibos = await _context.Recibos.ToListAsync();
                
                // Monto facturado: suma total de todos los recibos
                var montoFacturado = recibos.Sum(r => r.Total);

                // Monto recaudado: suma de todos los abonos
                var montoRecaudado = await _context.Abonos.SumAsync(a => (decimal?)a.Monto) ?? 0m;

                // Monto pendiente: recibos con estado "Pendiente" o "Parcial"
                var recibosPendientes = recibos
                    .Where(r => r.Estado == "Pendiente" || r.Estado == "Parcial")
                    .ToList();

                var montoPendiente = recibosPendientes.Sum(r => r.Total);

                // Calcular abonos realizados en recibos pendientes
                var recibosPendientesIds = recibosPendientes.Select(r => r.Id).ToList();
                
                if (recibosPendientesIds.Any())
                {
                    var abonos = await _context.Abonos
                        .Where(a => a.ReciboId.HasValue)
                        .ToListAsync();

                    var abonosEnPendientes = abonos
                        .Where(a => recibosPendientesIds.Contains(a.ReciboId!.Value))
                        .Sum(a => a.Monto);

                    montoPendiente -= abonosEnPendientes;
                }

                // Monto exonerado: suma de descuentos aplicados por becas
                var montoExonerado = recibos.Sum(r => r.Descuento);

                // Próximos partidos
                var proximosPartidos = new List<object>();
                try
                {
                    proximosPartidos = await _context.Games
                        .Where(g => g.Fecha.HasValue && g.Fecha.Value >= DateTime.UtcNow)
                        .OrderBy(g => g.Fecha)
                        .Take(5)
                        .Select(g => new
                        {
                            g.Id,
                            GameDate = g.Fecha,
                            Opponent = g.Rival ?? g.EquipoVisitante,
                            Location = g.Ubicacion,
                            GameType = g.Titulo
                        })
                        .ToListAsync<object>();
                }
                catch
                {
                    // Si la tabla no existe, lista vacía
                }

                // Cumpleañeros del mes
                var mesActual = DateTime.UtcNow.Month;
                var cumpleaneros = await _context.Alumnos
                    .Where(a => a.FechaNacimiento.HasValue && a.FechaNacimiento.Value.Month == mesActual)
                    .Select(a => new
                    {
                        a.Id,
                        a.Nombre,
                        a.Apellido,
                        a.FechaNacimiento
                    })
                    .ToListAsync();

                // Alumnos de baja
                var alumnosDeBaja = await _context.Alumnos
                    .Where(a => a.Estado == "Inactivo" || a.Estado == "Suspendido")
                    .Select(a => new
                    {
                        a.Id,
                        a.Nombre,
                        a.Apellido,
                        a.Estado
                    })
                    .ToListAsync();

                // Alumnos recientes (últimos 30 días)
                var hace30Dias = DateTime.UtcNow.AddDays(-30);
                var alumnosRecientes = await _context.Alumnos
                    .Where(a => a.FechaRegistro >= hace30Dias)
                    .OrderByDescending(a => a.FechaRegistro)
                    .Select(a => new
                    {
                        a.Id,
                        a.Nombre,
                        a.Apellido,
                        FechaInscripcion = a.FechaRegistro
                    })
                    .ToListAsync();

                return Ok(new
                {
                    topStats = new
                    {
                        totalAlumnos,
                        alumnosActivos,
                        totalRepresentantes,
                        partidosJugados,
                        entrenamientos
                    },
                    financialStats = new
                    {
                        montoFacturado,
                        montoRecaudado,
                        montoPendiente,
                        montoExonerado
                    },
                    summaryData = new
                    {
                        proximosPartidos,
                        cumpleaneros,
                        alumnosDeBaja,
                        alumnosRecientes
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener estadísticas del dashboard", error = ex.Message });
            }
        }

        [HttpGet("financial-chart")]
        public async Task<ActionResult<object>> GetFinancialChart([FromQuery] int? seasonId = null)
        {
            try
            {
                var now = DateTime.UtcNow;
                var startDate = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-11); // Últimos 12 meses

                var months = new List<object>();

                for (int i = 0; i < 12; i++)
                {
                    var monthStart = startDate.AddMonths(i);
                    // Extend end date by 1 day as requested to cover timezone differences or edge cases
                    var monthEnd = monthStart.AddMonths(1).AddDays(1);

                    // Ingresos del mes (abonos realizados)
                    var ingresos = await _context.Abonos
                        .Where(a => a.Fecha >= monthStart && a.Fecha < monthEnd)
                        .SumAsync(a => (decimal?)a.Monto) ?? 0m;

                    // Egresos del mes
                    var egresos = await _context.Expenses
                        .Where(e => e.Fecha >= monthStart && e.Fecha < monthEnd)
                        .SumAsync(e => (decimal?)e.Monto) ?? 0m;

                    months.Add(new
                    {
                        month = monthStart.ToString("MMM yyyy"),
                        ingresos,
                        egresos
                    });
                }

                return Ok(months);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener datos del gráfico financiero", error = ex.Message });
            }
        }

        [HttpGet("attendance-chart")]
        public async Task<ActionResult<object>> GetAttendanceChart([FromQuery] int? seasonId = null)
        {
            try
            {
                // Por ahora retornamos datos vacíos
                // Esto se puede implementar cuando exista un sistema de asistencia
                return Ok(new List<object>());
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener datos de asistencia", error = ex.Message });
            }
        }
    }
}
