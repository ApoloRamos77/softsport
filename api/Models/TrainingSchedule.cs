using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("training_schedules")]
    public class TrainingSchedule : AuditableEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("nombre")]
        [MaxLength(200)]
        public string Nombre { get; set; } = string.Empty;

        [Column("descripcion")]
        public string? Descripcion { get; set; }

        [Column("categoria_id")]
        public int? CategoriaId { get; set; }

        [ForeignKey("CategoriaId")]
        public Categoria? Categoria { get; set; }

        [Column("entrenador_id")]
        public int? EntrenadorId { get; set; }

        // Configuration for generation
        // Format: "1,3,5" (1=Monday, 7=Sunday)
        [Required]
        [Column("dias_semana")]
        [MaxLength(100)]
        public string DiasSemana { get; set; } = string.Empty;

        [Required]
        [Column("hora_inicio")]
        public TimeSpan HoraInicio { get; set; }

        [Required]
        [Column("hora_fin")]
        public TimeSpan HoraFin { get; set; }

        [Column("ubicacion")]
        [MaxLength(500)]
        public string? Ubicacion { get; set; }

        [Column("temporada")]
        [MaxLength(100)]
        public string? Temporada { get; set; }

        [Column("estado")]
        [MaxLength(50)]
        public string Estado { get; set; } = "Activo";
    }
}
