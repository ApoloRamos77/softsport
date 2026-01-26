using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("alumno_becas")]
    public class AlumnoBeca
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("alumno_id")]
        public int AlumnoId { get; set; }

        [Required]
        [Column("beca_id")]
        public int BecaId { get; set; }

        [Column("fecha_asignada")]
        public DateTime FechaAsignada { get; set; } = DateTime.UtcNow;
    }
}
