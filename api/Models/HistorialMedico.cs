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

        // Datos de Composición Corporal
        [Column("porcentaje_grasa")]
        public decimal? PorcentajeGrasa { get; set; }

        [Column("porcentaje_musculo")]
        public decimal? PorcentajeMusculo { get; set; }

        [Column("grasa_visceral")]
        public decimal? GrasaVisceral { get; set; }

        // Perímetros (en cm)
        [Column("cintura")]
        public decimal? Cintura { get; set; }

        [Column("cadera")]
        public decimal? Cadera { get; set; }

        [Column("brazo_relajado")]
        public decimal? BrazoRelajado { get; set; }

        [Column("brazo_contraido")]
        public decimal? BrazoContraido { get; set; }

        [Column("muslo")]
        public decimal? Muslo { get; set; }

        // Navigation property
        [ForeignKey("AlumnoId")]
        public Alumno? Alumno { get; set; }
    }
}
