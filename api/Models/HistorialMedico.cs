using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("historial_medico")]
    public class HistorialMedico : AuditableEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("alumno_id")]
        public int AlumnoId { get; set; }

        [Column("peso")]
        public decimal? Peso { get; set; }

        [Column("talla")]
        public decimal? Talla { get; set; }

        [Column("imc")]
        public decimal? Imc { get; set; }

        [Column("fecha_toma")]
        public DateTime FechaToma { get; set; } = DateTime.Now;

        [Column("observaciones")]
        public string? Observaciones { get; set; }

        // Navigation property
        [ForeignKey("AlumnoId")]
        public Alumno? Alumno { get; set; }
    }
}
