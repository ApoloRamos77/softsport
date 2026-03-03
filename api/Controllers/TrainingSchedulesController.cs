using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TrainingSchedulesController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public TrainingSchedulesController(SoftSportDbContext context)
        {
            _context = context;
        }

        // GET: api/TrainingSchedules
        // GET: api/TrainingSchedules
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TrainingSchedule>>> GetTrainingSchedules()
        {
            return await _context.TrainingSchedules
                .Include(t => t.Categoria)
                .Where(t => t.FechaAnulacion == null)
                .ToListAsync();
        }

        // GET: api/TrainingSchedules/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TrainingSchedule>> GetTrainingSchedule(int id)
        {
            var trainingSchedule = await _context.TrainingSchedules
                .Include(t => t.Categoria)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (trainingSchedule == null)
            {
                return NotFound();
            }

            return trainingSchedule;
        }

        // POST: api/TrainingSchedules
        [HttpPost]
        public async Task<ActionResult<TrainingSchedule>> PostTrainingSchedule([FromBody] TrainingScheduleUpdateDto dto)
        {
            // Validar entrenadorId antes de insertar (evita FK violation)
            int? validEntrenadorId = null;
            if (dto.EntrenadorId.HasValue && dto.EntrenadorId.Value > 0)
            {
                var existe = await _context.Personal.AnyAsync(p => p.Id == dto.EntrenadorId.Value);
                validEntrenadorId = existe ? dto.EntrenadorId : null;
            }

            var schedule = new TrainingSchedule
            {
                Nombre       = dto.Nombre,
                Descripcion  = dto.Descripcion,
                CategoriaId  = dto.CategoriaId,
                EntrenadorId = validEntrenadorId,
                DiasSemana   = dto.DiasSemana ?? "",
                Ubicacion    = dto.Ubicacion,
                Estado       = dto.Estado ?? "Activo"
            };

            // Parsear horarios
            if (!string.IsNullOrWhiteSpace(dto.HoraInicio) && TimeSpan.TryParse(dto.HoraInicio, out var hi))
                schedule.HoraInicio = hi;
            if (!string.IsNullOrWhiteSpace(dto.HoraFin) && TimeSpan.TryParse(dto.HoraFin, out var hf))
                schedule.HoraFin = hf;

            _context.TrainingSchedules.Add(schedule);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("fkey") == true
                                            || ex.InnerException?.Message.Contains("foreign key") == true)
            {
                schedule.EntrenadorId = null;
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetTrainingSchedule), new { id = schedule.Id }, schedule);
        }



        // PUT: api/TrainingSchedules/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTrainingSchedule(int id, [FromBody] TrainingScheduleUpdateDto dto)
        {
            if (id != dto.Id)
            {
                return BadRequest("El ID de la URL no coincide con el ID del cuerpo.");
            }

            var schedule = await _context.TrainingSchedules.FindAsync(id);
            if (schedule == null)
            {
                return NotFound($"Configuración {id} no encontrada.");
            }

            // Actualizar solo campos editables (NO tocar auditoría — SaveChangesAsync lo maneja)
            schedule.Nombre      = dto.Nombre;
            schedule.Descripcion = dto.Descripcion;
            schedule.CategoriaId = dto.CategoriaId;
            schedule.DiasSemana  = dto.DiasSemana ?? schedule.DiasSemana;
            schedule.Ubicacion   = dto.Ubicacion;
            schedule.Estado      = dto.Estado ?? schedule.Estado;

            // Validar entrenadorId antes de asignar (evita FK violation)
            if (dto.EntrenadorId.HasValue && dto.EntrenadorId.Value > 0)
            {
                var entrenadorExiste = await _context.Personal
                    .AnyAsync(p => p.Id == dto.EntrenadorId.Value);
                schedule.EntrenadorId = entrenadorExiste ? dto.EntrenadorId : null;
            }
            else
            {
                schedule.EntrenadorId = null;
            }

            // Parsear horarios (vienen como string "HH:mm:ss")
            if (!string.IsNullOrWhiteSpace(dto.HoraInicio) && TimeSpan.TryParse(dto.HoraInicio, out var hi))
                schedule.HoraInicio = hi;

            if (!string.IsNullOrWhiteSpace(dto.HoraFin) && TimeSpan.TryParse(dto.HoraFin, out var hf))
                schedule.HoraFin = hf;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TrainingScheduleExists(id))
                    return NotFound();
                throw;
            }
            catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("fkey") == true
                                             || ex.InnerException?.Message.Contains("foreign key") == true)
            {
                // FK violation — limpiar entrenadorId y reintentar
                schedule.EntrenadorId = null;
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }



        // DELETE: api/TrainingSchedules/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTrainingSchedule(int id)
        {
            var trainingSchedule = await _context.TrainingSchedules.FindAsync(id);
            if (trainingSchedule == null)
            {
                return NotFound();
            }

            // Soft delete
            trainingSchedule.FechaAnulacion = DateTime.Now;
            trainingSchedule.UsuarioAnulacion = "system"; // TODO: Get user
            
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/TrainingSchedules/generate
        [HttpPost("generate")]
        public async Task<ActionResult> GenerateTrainings([FromBody] GenerateRequest request)
        {
            var schedule = await _context.TrainingSchedules.FindAsync(request.ScheduleId);
            if (schedule == null)
            {
                return NotFound("Schedule not found");
            }

            var daysOfWeek = schedule.DiasSemana.Split(',').Select(int.Parse).ToList();
            // 1=Monday, 7=Sunday in our logic, but DayOfWeek 0=Sunday, 1=Monday
            // Map our 1-7 to DayOfWeek
            var targetDays = daysOfWeek.Select(d => d == 7 ? DayOfWeek.Sunday : (DayOfWeek)d).ToList();

            var startDate = new DateTime(request.Year, request.Month, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1);

            int count = 0;
            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                if (targetDays.Contains(date.DayOfWeek))
                {
                    // Check if already exists for this schedule and date
                    bool exists = await _context.Trainings.AnyAsync(t => 
                        t.TrainingScheduleId == schedule.Id && 
                        t.Fecha.HasValue && 
                        t.Fecha.Value.Date == date.Date &&
                        t.FechaAnulacion == null
                    );

                    if (!exists)
                    {
                        var training = new Training
                        {
                            Titulo = schedule.Nombre,
                            Descripcion = schedule.Descripcion,
                            CategoriaId = schedule.CategoriaId,
                            EntrenadorId = schedule.EntrenadorId,
                            Fecha = date,
                            HoraInicio = schedule.HoraInicio,
                            HoraFin = schedule.HoraFin,
                            Ubicacion = schedule.Ubicacion,
                            Tipo = "Entrenamiento Regular", 
                            Estado = "Programado",
                            TrainingScheduleId = schedule.Id
                        };
                        _context.Trainings.Add(training);
                        count++;
                    }
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Generated {count} trainings for {startDate:MMMM yyyy}" });
        }

        private bool TrainingScheduleExists(int id)
        {
            return _context.TrainingSchedules.Any(e => e.Id == id);
        }
    }

    public class GenerateRequest
    {
        public int ScheduleId { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
    }

    public class TrainingScheduleUpdateDto
    {
        public int     Id           { get; set; }
        public string  Nombre       { get; set; } = string.Empty;
        public string? Descripcion  { get; set; }
        public int?    CategoriaId  { get; set; }
        public int?    EntrenadorId { get; set; }
        public string? DiasSemana   { get; set; }
        public string? HoraInicio   { get; set; }
        public string? HoraFin      { get; set; }
        public string? Ubicacion    { get; set; }
        public string? Estado       { get; set; }
    }
}
