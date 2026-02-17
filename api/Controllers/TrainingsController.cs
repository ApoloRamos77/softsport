using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TrainingsController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public TrainingsController(SoftSportDbContext context)
        {
            _context = context;
        }

        // GET: api/Trainings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Training>>> GetTrainings()
        {
            return await _context.Trainings
                .Include(t => t.Categoria)
                .Include(t => t.Entrenador)
                .Include(t => t.TrainingCategorias)
                    .ThenInclude(tc => tc.Categoria)
                .Where(t => t.FechaAnulacion == null)
                .OrderByDescending(t => t.Fecha)
                .ToListAsync();
        }

        // GET: api/Trainings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Training>> GetTraining(int id)
        {
            var training = await _context.Trainings
                .Include(t => t.Categoria)
                .Include(t => t.Entrenador)
                .Include(t => t.TrainingCategorias)
                    .ThenInclude(tc => tc.Categoria)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (training == null)
            {
                return NotFound();
            }

            return training;
        }

        // POST: api/Trainings
        [HttpPost]
        public async Task<ActionResult<Training>> PostTraining([FromBody] DTOs.TrainingDto trainingDto)
        {
            var training = new Training
            {
                Titulo = trainingDto.Titulo,
                Descripcion = trainingDto.Descripcion,
                Fecha = trainingDto.Fecha,
                HoraInicio = trainingDto.HoraInicio != null ? TimeSpan.Parse(trainingDto.HoraInicio) : null,
                HoraFin = trainingDto.HoraFin != null ? TimeSpan.Parse(trainingDto.HoraFin) : null,
                Ubicacion = trainingDto.Ubicacion,
                CategoriaId = trainingDto.CategoriaId,
                EntrenadorId = trainingDto.EntrenadorId,
                Estado = trainingDto.Estado,
                TrainingScheduleId = trainingDto.TrainingScheduleId
            };

            _context.Trainings.Add(training);
            await _context.SaveChangesAsync();

            //  Add TrainingCategorias if categoriaIds provided
            if (trainingDto.CategoriaIds != null && trainingDto.CategoriaIds.Count > 0)
            {
                foreach (var catId in trainingDto.CategoriaIds)
                {
                    _context.TrainingCategorias.Add(new TrainingCategoria
                    {
                        TrainingId = training.Id,
                        CategoriaId = catId
                    });
                }
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetTraining), new { id = training.Id }, training);
        }

        // PUT: api/Trainings/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTraining(int id, [FromBody] DTOs.TrainingDto trainingDto)
        {
            if (id != trainingDto.Id)
            {
                return BadRequest();
            }

            var training = await _context.Trainings.FindAsync(id);
            if (training == null)
            {
                return NotFound();
            }

            // Update training properties
            training.Titulo = trainingDto.Titulo;
            training.Descripcion = trainingDto.Descripcion;
            training.Fecha = trainingDto.Fecha;
            training.HoraInicio = trainingDto.HoraInicio != null ? TimeSpan.Parse(trainingDto.HoraInicio) : null;
            training.HoraFin = trainingDto.HoraFin != null ? TimeSpan.Parse(trainingDto.HoraFin) : null;
            training.Ubicacion = trainingDto.Ubicacion;
            training.CategoriaId = trainingDto.CategoriaId;
            training.EntrenadorId = trainingDto.EntrenadorId;
            training.Estado = trainingDto.Estado;

            // Update category associations if provided
            if (trainingDto.CategoriaIds != null && trainingDto.CategoriaIds.Count > 0)
            {
                // Remove existing associations
                var existingAssociations = _context.TrainingCategorias.Where(tc => tc.TrainingId == id);
                _context.TrainingCategorias.RemoveRange(existingAssociations);

                // Add new associations
                foreach (var catId in trainingDto.CategoriaIds)
                {
                    _context.TrainingCategorias.Add(new TrainingCategoria
                    {
                        TrainingId = id,
                        CategoriaId = catId
                    });
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TrainingExists(id))
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

        // DELETE: api/Trainings/5 (Soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTraining(int id)
        {
            var training = await _context.Trainings.FindAsync(id);
            if (training == null)
            {
                return NotFound();
            }

            // Soft delete: solo marcar como anulado
            training.FechaAnulacion = DateTime.UtcNow;
            training.UsuarioAnulacion = "admin"; // TODO: obtener del usuario autenticado
            
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TrainingExists(int id)
        {
            return _context.Trainings.Any(e => e.Id == id);
        }
    }
}
