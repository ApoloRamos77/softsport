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
    }
}
