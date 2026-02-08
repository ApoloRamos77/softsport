using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("bioquimica")]
    public class Bioquimica : AuditableEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("alumno_id")]
        public int AlumnoId { get; set; }

        [Column("fecha_toma")]
        public DateTime FechaToma { get; set; } = DateTime.Now;

        [Column("hemoglobina")]
        public decimal? Hemoglobina { get; set; }

        [Column("hematocrito")]
        public decimal? Hematocrito { get; set; }

        [Column("glucosa_basal")]
        public decimal? GlucosaBasal { get; set; }

        [Column("colesterol_total")]
        public decimal? ColesterolTotal { get; set; }

        [Column("trigliceridos")]
        public decimal? Trigliceridos { get; set; }

        [Column("vitamina_d")]
        public decimal? VitaminaD { get; set; }

        [Column("ferritina")]
        public decimal? Ferritina { get; set; }

        [Column("observaciones")]
        public string? Observaciones { get; set; }

        // Navigation property
        [ForeignKey("AlumnoId")]
        public Alumno? Alumno { get; set; }
    }
}
