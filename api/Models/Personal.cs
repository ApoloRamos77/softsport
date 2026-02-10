using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("personal")]
    public class Personal : AuditableEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("nombres")]
        [MaxLength(100)]
        public string Nombres { get; set; } = string.Empty;

        [Required]
        [Column("apellidos")]
        [MaxLength(100)]
        public string Apellidos { get; set; } = string.Empty;

        [Column("dni")]
        [MaxLength(20)]
        public string? Dni { get; set; }

        [Column("celular")]
        [MaxLength(20)]
        public string? Celular { get; set; }

        [Column("fecha_nacimiento")]
        public DateTime? FechaNacimiento { get; set; }

        [Column("cargo")]
        [MaxLength(50)]
        public string? Cargo { get; set; } // Administrativo, Nutricionista, Terapeuta, Paramedico, Entrenador

        [Column("estado")]
        [MaxLength(20)]
        public string Estado { get; set; } = "Activo";
    }
}
