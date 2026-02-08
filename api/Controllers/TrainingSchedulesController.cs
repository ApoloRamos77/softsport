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
        public async Task<ActionResult<TrainingSchedule>> PostTrainingSchedule(TrainingSchedule trainingSchedule)
        {
            _context.TrainingSchedules.Add(trainingSchedule);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTrainingSchedule), new { id = trainingSchedule.Id }, trainingSchedule);
        }

        // PUT: api/TrainingSchedules/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTrainingSchedule(int id, TrainingSchedule trainingSchedule)
        {
            if (id != trainingSchedule.Id)
            {
                return BadRequest();
            }

            _context.Entry(trainingSchedule).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TrainingScheduleExists(id))
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
}
