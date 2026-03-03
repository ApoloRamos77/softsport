using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TrainingAsistenciasController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public TrainingAsistenciasController(SoftSportDbContext context)
        {
            _context = context;
        }

        // ─────────────────────────────────────────────────────────
        // GET: api/TrainingAsistencias/training/{trainingId}
        // Obtiene todos los registros de asistencia de un entrenamiento
        // ─────────────────────────────────────────────────────────
        [HttpGet("training/{trainingId}")]
        public async Task<ActionResult<IEnumerable<TrainingAsistencia>>> GetByTraining(int trainingId)
        {
            return await _context.TrainingAsistencias
                .Include(ta => ta.Alumno)
                .Where(ta => ta.TrainingId == trainingId && ta.FechaAnulacion == null)
                .OrderBy(ta => ta.Alumno!.Apellido)
                .ThenBy(ta => ta.Alumno!.Nombre)
                .ToListAsync();
        }

        // ─────────────────────────────────────────────────────────
        // GET: api/TrainingAsistencias/alumno/{alumnoId}
        // Historial de asistencia de un alumno específico
        // ─────────────────────────────────────────────────────────
        [HttpGet("alumno/{alumnoId}")]
        public async Task<ActionResult<IEnumerable<TrainingAsistencia>>> GetByAlumno(int alumnoId)
        {
            return await _context.TrainingAsistencias
                .Include(ta => ta.Training)
                .Where(ta => ta.AlumnoId == alumnoId && ta.FechaAnulacion == null)
                .OrderByDescending(ta => ta.Training!.Fecha)
                .ToListAsync();
        }

        // ─────────────────────────────────────────────────────────
        // GET: api/TrainingAsistencias/stats/{trainingId}
        // Resumen estadístico de un entrenamiento
        // ─────────────────────────────────────────────────────────
        [HttpGet("stats/{trainingId}")]
        public async Task<ActionResult<object>> GetStats(int trainingId)
        {
            var registros = await _context.TrainingAsistencias
                .Where(ta => ta.TrainingId == trainingId && ta.FechaAnulacion == null)
                .ToListAsync();

            return Ok(new
            {
                total     = registros.Count,
                presentes = registros.Count(r => r.Estado == "Presente"),
                tardanzas = registros.Count(r => r.Estado == "Tardanza"),
                ausentes  = registros.Count(r => r.Estado == "Ausente"),
                porcentajeAsistencia = registros.Count == 0 ? 0 :
                    Math.Round((double)(registros.Count(r => r.Estado == "Presente" || r.Estado == "Tardanza")) 
                    / registros.Count * 100, 1)
            });
        }

        // ─────────────────────────────────────────────────────────
        // POST: api/TrainingAsistencias/batch
        // Guarda o actualiza la lista completa de asistencia de un entrenamiento (upsert)
        // ─────────────────────────────────────────────────────────
        [HttpPost("batch")]
        public async Task<IActionResult> SaveBatch([FromBody] BatchAsistenciaDto dto)
        {
            if (dto.TrainingId <= 0 || dto.Registros == null || !dto.Registros.Any())
                return BadRequest("Debe proporcionar un trainingId y al menos un registro.");

            // Verificar que el entrenamiento existe
            var training = await _context.Trainings.FindAsync(dto.TrainingId);
            if (training == null)
                return NotFound($"Entrenamiento {dto.TrainingId} no encontrado.");

            foreach (var reg in dto.Registros)
            {
                // Buscar si ya existe un registro para este par training/alumno
                var existente = await _context.TrainingAsistencias
                    .FirstOrDefaultAsync(ta => 
                        ta.TrainingId == dto.TrainingId && 
                        ta.AlumnoId == reg.AlumnoId && 
                        ta.FechaAnulacion == null);

                if (existente == null)
                {
                    // Crear nuevo
                    _context.TrainingAsistencias.Add(new TrainingAsistencia
                    {
                        TrainingId       = dto.TrainingId,
                        AlumnoId         = reg.AlumnoId,
                        Estado           = reg.Estado,
                        MinutosTardanza  = reg.Estado == "Tardanza" ? reg.MinutosTardanza : null,
                        Observaciones    = reg.Observaciones
                    });
                }
                else
                {
                    // Actualizar existente
                    existente.Estado          = reg.Estado;
                    existente.MinutosTardanza = reg.Estado == "Tardanza" ? reg.MinutosTardanza : null;
                    existente.Observaciones   = reg.Observaciones;
                }
            }

            await _context.SaveChangesAsync();

            // Devolver resumen
            var presentes = dto.Registros.Count(r => r.Estado == "Presente");
            var tardanzas = dto.Registros.Count(r => r.Estado == "Tardanza");
            var ausentes  = dto.Registros.Count(r => r.Estado == "Ausente");

            return Ok(new
            {
                mensaje   = "Lista de asistencia guardada correctamente.",
                total     = dto.Registros.Count,
                presentes,
                tardanzas,
                ausentes
            });
        }

        // ─────────────────────────────────────────────────────────
        // PUT: api/TrainingAsistencias/{id}
        // Actualiza un registro individual
        // ─────────────────────────────────────────────────────────
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAsistencia(int id, [FromBody] AsistenciaUpdateDto dto)
        {
            var registro = await _context.TrainingAsistencias.FindAsync(id);
            if (registro == null) return NotFound();

            registro.Estado         = dto.Estado;
            registro.MinutosTardanza = dto.Estado == "Tardanza" ? dto.MinutosTardanza : null;
            registro.Observaciones  = dto.Observaciones;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ─────────────────────────────────────────────────────────
        // DELETE: api/TrainingAsistencias/{id}  (Soft delete)
        // ─────────────────────────────────────────────────────────
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsistencia(int id)
        {
            var registro = await _context.TrainingAsistencias.FindAsync(id);
            if (registro == null) return NotFound();

            registro.FechaAnulacion  = DateTime.UtcNow;
            registro.UsuarioAnulacion = "admin";
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    // ─────────────────────────────────────────────────────────
    // DTOs locales para este controlador
    // ─────────────────────────────────────────────────────────
    public class BatchAsistenciaDto
    {
        public int TrainingId { get; set; }
        public List<RegistroAsistenciaDto> Registros { get; set; } = new();
    }

    public class RegistroAsistenciaDto
    {
        public int    AlumnoId        { get; set; }
        public string Estado          { get; set; } = "Presente"; // Presente | Tardanza | Ausente
        public int?   MinutosTardanza { get; set; }
        public string? Observaciones  { get; set; }
    }

    public class AsistenciaUpdateDto
    {
        public string Estado          { get; set; } = "Presente";
        public int?   MinutosTardanza { get; set; }
        public string? Observaciones  { get; set; }
    }
}
