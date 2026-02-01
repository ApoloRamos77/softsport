using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("games")]
    public class Game : AuditableEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("titulo")]
        [MaxLength(200)]
        public string? Titulo { get; set; }

        [Column("fecha")]
        public DateTime? Fecha { get; set; }

        [Column("categoria_id")]
        public int? CategoriaId { get; set; }

        [Column("es_local")]
        public bool EsLocal { get; set; }

        [Column("equipo_local")]
        [MaxLength(200)]
        public string? EquipoLocal { get; set; }

        [Column("equipo_visitante")]
        [MaxLength(200)]
        public string? EquipoVisitante { get; set; }

        [Column("ubicacion")]
        [MaxLength(250)]
        public string? Ubicacion { get; set; }

        [Column("observaciones")]
        [MaxLength(1000)]
        public string? Observaciones { get; set; }

        [Column("rival")]
        [MaxLength(200)]
        public string? Rival { get; set; }

        [Column("score_local")]
        public int? ScoreLocal { get; set; }

        [Column("score_visitante")]
        public int? ScoreVisitante { get; set; }

        // Relación con Categoria
        [ForeignKey("CategoriaId")]
        public Categoria? Categoria { get; set; }

        // Relación con los alumnos convocados
        public ICollection<GameAlumno> AlumnosConvocados { get; set; } = new List<GameAlumno>();
    }

    [Table("game_alumnos")]
    public class GameAlumno
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("game_id")]
        public int GameId { get; set; }

        [Column("alumno_id")]
        public int AlumnoId { get; set; }

        // Relaciones
        [ForeignKey("GameId")]
        [System.Text.Json.Serialization.JsonIgnore]
        public Game? Game { get; set; }

        [ForeignKey("AlumnoId")]
        public Alumno? Alumno { get; set; }
    }
}
