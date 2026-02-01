using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("representantes")]
    public class Representante : AuditableEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("nombre")]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [Column("apellido")]
        [MaxLength(100)]
        public string Apellido { get; set; } = string.Empty;

        [Column("documento")]
        [MaxLength(50)]
        public string? Documento { get; set; }

        [Column("email")]
        [MaxLength(255)]
        public string? Email { get; set; }

        [Column("telefono")]
        [MaxLength(50)]
        public string? Telefono { get; set; }

        [Column("parentesco")]
        [MaxLength(50)]
        public string? Parentesco { get; set; }

        [Column("direccion")]
        [MaxLength(250)]
        public string? Direccion { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        [System.Text.Json.Serialization.JsonIgnore]
        public ICollection<Alumno> Alumnos { get; set; } = new List<Alumno>();
    }
}
