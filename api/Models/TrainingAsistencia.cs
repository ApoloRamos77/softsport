using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("training_asistencias")]
    public class TrainingAsistencia : AuditableEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("training_id")]
        public int TrainingId { get; set; }

        [ForeignKey("TrainingId")]
        public Training? Training { get; set; }

        [Required]
        [Column("alumno_id")]
        public int AlumnoId { get; set; }

        [ForeignKey("AlumnoId")]
        public Alumno? Alumno { get; set; }

        /// <summary>
        /// Estado de asistencia: "Presente" | "Tardanza" | "Ausente"
        /// </summary>
        [Required]
        [Column("estado")]
        [MaxLength(20)]
        public string Estado { get; set; } = "Presente";

        /// <summary>
        /// Minutos de tardanza (solo aplica cuando Estado == "Tardanza")
        /// </summary>
        [Column("minutos_tardanza")]
        public int? MinutosTardanza { get; set; }

        [Column("observaciones")]
        public string? Observaciones { get; set; }
    }
}
