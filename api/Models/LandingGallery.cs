using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("landing_galleries")]
    public class LandingGallery : AuditableEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("tipo")]
        [MaxLength(50)]
        public string Tipo { get; set; } = string.Empty; // 'Entrenamiento', 'Torneo'

        [Required]
        [Column("image_url")]
        public string ImageUrl { get; set; } = string.Empty;

        [Column("titulo")]
        [MaxLength(200)]
        public string? Titulo { get; set; }

        [Column("descripcion")]
        public string? Descripcion { get; set; }

        [Column("fecha")]
        public DateTime? Fecha { get; set; }
    }
}
