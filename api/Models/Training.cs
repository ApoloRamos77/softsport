using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("trainings")]
    public class Training : AuditableEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("titulo")]
        [MaxLength(200)]
        public string Titulo { get; set; } = string.Empty;

        [Column("descripcion")]
        [MaxLength(1000)]
        public string? Descripcion { get; set; }

        [Column("fecha")]
        public DateTime? Fecha { get; set; }

        [Column("hora_inicio")]
        public TimeSpan? HoraInicio { get; set; }

        [Column("hora_fin")]
        public TimeSpan? HoraFin { get; set; }

        [Column("ubicacion")]
        [MaxLength(500)]
        public string? Ubicacion { get; set; }

        [Column("categoria_id")]
        public int? CategoriaId { get; set; }

        [ForeignKey("CategoriaId")]
        public Categoria? Categoria { get; set; }

        [Column("tipo")]
        [MaxLength(100)]
        public string? Tipo { get; set; }

        [Column("estado")]
        [MaxLength(50)]
        public string Estado { get; set; } = "Programado";

        [Column("entrenador_id")]
        public int? EntrenadorId { get; set; }

        [ForeignKey("EntrenadorId")]
        public Personal? Entrenador { get; set; }

        [Column("training_schedule_id")]
        public int? TrainingScheduleId { get; set; }

        [ForeignKey("TrainingScheduleId")]
        public TrainingSchedule? TrainingSchedule { get; set; }

        // Many-to-many relationship with Categorias
        public ICollection<TrainingCategoria> TrainingCategorias { get; set; } = new List<TrainingCategoria>();

        // Helper property to get categorias directly (not mapped)
        [NotMapped]
        public List<Categoria> Categorias 
        { 
            get => TrainingCategorias?.Select(tc => tc.Categoria).Where(c => c != null).ToList() ?? new List<Categoria>();
        }
    }
}
