using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("becas")]
    public class Beca : AuditableEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("nombre")]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [Column("porcentaje", TypeName = "decimal(5,2)")]
        public decimal Porcentaje { get; set; }

        [Column("descripcion")]
        [MaxLength(500)]
        public string? Descripcion { get; set; }

        // Navigation property
        [System.Text.Json.Serialization.JsonIgnore]
        public ICollection<Alumno> Alumnos { get; set; } = new List<Alumno>();
    }
}
