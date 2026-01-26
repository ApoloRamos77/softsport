using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GamesController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public GamesController(SoftSportDbContext context)
        {
            _context = context;
        }

        // GET: api/Games
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetGames()
        {
            var games = await _context.Games
                .Include(g => g.Categoria)
                .Include(g => g.AlumnosConvocados)
                    .ThenInclude(ga => ga.Alumno)
                .Select(g => new
                {
                    g.Id,
                    g.Titulo,
                    g.Fecha,
                    g.CategoriaId,
                    CategoriaNombre = g.Categoria != null ? g.Categoria.Nombre : null,
                    g.EsLocal,
                    g.EquipoLocal,
                    g.EquipoVisitante,
                    g.Ubicacion,
                    g.Observaciones,
                    g.Rival,
                    g.ScoreLocal,
                    g.ScoreVisitante,
                    AlumnosConvocados = g.AlumnosConvocados.Select(ga => new
                    {
                        ga.AlumnoId,
                        NombreCompleto = ga.Alumno != null ? ga.Alumno.Nombre + " " + ga.Alumno.Apellido : null
                    }).ToList()
                })
                .ToListAsync();

            return Ok(games);
        }

        // GET: api/Games/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetGame(int id)
        {
            var game = await _context.Games
                .Include(g => g.Categoria)
                .Include(g => g.AlumnosConvocados)
                    .ThenInclude(ga => ga.Alumno)
                .Where(g => g.Id == id)
                .Select(g => new
                {
                    g.Id,
                    g.Titulo,
                    g.Fecha,
                    g.CategoriaId,
                    CategoriaNombre = g.Categoria != null ? g.Categoria.Nombre : null,
                    g.EsLocal,
                    g.EquipoLocal,
                    g.EquipoVisitante,
                    g.Ubicacion,
                    g.Observaciones,
                    g.Rival,
                    g.ScoreLocal,
                    g.ScoreVisitante,
                    AlumnosConvocadosIds = g.AlumnosConvocados.Select(ga => ga.AlumnoId).ToList(),
                    AlumnosConvocados = g.AlumnosConvocados.Select(ga => new
                    {
                        ga.AlumnoId,
                        NombreCompleto = ga.Alumno != null ? ga.Alumno.Nombre + " " + ga.Alumno.Apellido : null
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (game == null)
            {
                return NotFound();
            }

            return Ok(game);
        }

        // POST: api/Games
        [HttpPost]
        public async Task<ActionResult<Game>> PostGame([FromBody] GameDto gameDto)
        {
            if (gameDto == null)
            {
                return BadRequest("Datos del juego inválidos");
            }

            // Validar que haya al menos un alumno convocado
            if (gameDto.AlumnosConvocadosIds == null || !gameDto.AlumnosConvocadosIds.Any())
            {
                return BadRequest("Debes convocar al menos un atleta");
            }

            var game = new Game
            {
                Titulo = gameDto.Titulo,
                Fecha = gameDto.Fecha,
                CategoriaId = gameDto.CategoriaId,
                EsLocal = gameDto.EsLocal,
                EquipoLocal = gameDto.EquipoLocal,
                EquipoVisitante = gameDto.EquipoVisitante,
                Ubicacion = gameDto.Ubicacion,
                Observaciones = gameDto.Observaciones,
                Rival = gameDto.EquipoVisitante, // Mantener compatibilidad
                ScoreLocal = gameDto.ScoreLocal,
                ScoreVisitante = gameDto.ScoreVisitante
            };

            _context.Games.Add(game);
            await _context.SaveChangesAsync();

            // Agregar los alumnos convocados
            if (gameDto.AlumnosConvocadosIds != null)
            {
                foreach (var alumnoId in gameDto.AlumnosConvocadosIds)
                {
                    var gameAlumno = new GameAlumno
                    {
                        GameId = game.Id,
                        AlumnoId = alumnoId
                    };
                    _context.GameAlumnos.Add(gameAlumno);
                }
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetGame), new { id = game.Id }, game);
        }

        // PUT: api/Games/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutGame(int id, [FromBody] GameDto gameDto)
        {
            if (gameDto == null)
            {
                return BadRequest("Datos del juego inválidos");
            }

            // Validar que haya al menos un alumno convocado
            if (gameDto.AlumnosConvocadosIds == null || !gameDto.AlumnosConvocadosIds.Any())
            {
                return BadRequest("Debes convocar al menos un atleta");
            }

            var game = await _context.Games
                .Include(g => g.AlumnosConvocados)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (game == null)
            {
                return NotFound();
            }

            // Actualizar los campos del juego
            game.Titulo = gameDto.Titulo;
            game.Fecha = gameDto.Fecha;
            game.CategoriaId = gameDto.CategoriaId;
            game.EsLocal = gameDto.EsLocal;
            game.EquipoLocal = gameDto.EquipoLocal;
            game.EquipoVisitante = gameDto.EquipoVisitante;
            game.Ubicacion = gameDto.Ubicacion;
            game.Observaciones = gameDto.Observaciones;
            game.Rival = gameDto.EquipoVisitante; // Mantener compatibilidad
            game.ScoreLocal = gameDto.ScoreLocal;
            game.ScoreVisitante = gameDto.ScoreVisitante;

            // Eliminar las convocatorias anteriores
            _context.GameAlumnos.RemoveRange(game.AlumnosConvocados);

            // Agregar las nuevas convocatorias
            if (gameDto.AlumnosConvocadosIds != null)
            {
                foreach (var alumnoId in gameDto.AlumnosConvocadosIds)
                {
                    var gameAlumno = new GameAlumno
                    {
                        GameId = game.Id,
                        AlumnoId = alumnoId
                    };
                    _context.GameAlumnos.Add(gameAlumno);
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GameExists(id))
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

        // DELETE: api/Games/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGame(int id)
        {
            var game = await _context.Games.FindAsync(id);
            if (game == null)
            {
                return NotFound();
            }

            _context.Games.Remove(game);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool GameExists(int id)
        {
            return _context.Games.Any(e => e.Id == id);
        }
    }

    // DTO para crear/editar juegos
    public class GameDto
    {
        public string? Titulo { get; set; }
        public DateTime? Fecha { get; set; }
        public int? CategoriaId { get; set; }
        public bool EsLocal { get; set; }
        public string? EquipoLocal { get; set; }
        public string? EquipoVisitante { get; set; }
        public string? Ubicacion { get; set; }
        public string? Observaciones { get; set; }
        public int? ScoreLocal { get; set; }
        public int? ScoreVisitante { get; set; }
        public List<int>? AlumnosConvocadosIds { get; set; }
    }
}
