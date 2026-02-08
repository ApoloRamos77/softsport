using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("plan_nutricional")]
    public class PlanNutricional : AuditableEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("alumno_id")]
        public int AlumnoId { get; set; }

        [Column("fecha_inicio")]
        public DateTime FechaInicio { get; set; }

        [Column("fecha_fin")]
        public DateTime? FechaFin { get; set; }

        [Column("objetivo")]
        [MaxLength(200)]
        public string? Objetivo { get; set; }

        [Column("tmb")]
        public decimal? TMB { get; set; }

        [Column("gasto_energetico_total")]
        public decimal? GastoEnergeticoTotal { get; set; }

        // Macros (g/día)
        [Column("proteinas")]
        public int? Proteinas { get; set; }

        [Column("carbohidratos")]
        public int? Carbohidratos { get; set; }

        [Column("grasas")]
        public int? Grasas { get; set; }

        [Column("observaciones")]
        public string? Observaciones { get; set; }

        [Column("archivo_ruta")]
        [MaxLength(500)]
        public string? ArchivoRuta { get; set; }

        // Navigation property
        [ForeignKey("AlumnoId")]
        public Alumno? Alumno { get; set; }

        public ICollection<Suplementacion> Suplementaciones { get; set; } = new List<Suplementacion>();
    }
}
