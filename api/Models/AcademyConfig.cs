using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("academy_config")]
    public class AcademyConfig
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("nombre")]
        [MaxLength(200)]
        public string Nombre { get; set; } = string.Empty;

        [Column("email")]
        [MaxLength(200)]
        public string? Email { get; set; }

        [Column("telefono")]
        [MaxLength(50)]
        public string? Telefono { get; set; }

        [Column("direccion")]
        [MaxLength(500)]
        public string? Direccion { get; set; }

        [Column("logo_url")]
        [MaxLength(500)]
        public string? LogoUrl { get; set; }

        [Column("color_menu")]
        [MaxLength(20)]
        public string ColorMenu { get; set; } = "#1a73e8";

        [Column("color_botones")]
        [MaxLength(20)]
        public string ColorBotones { get; set; } = "#0B66FF";

        [Column("whatsapp_activado")]
        public bool WhatsAppActivado { get; set; } = false;

        [Column("partidas_activado")]
        public bool PartidasActivado { get; set; } = false;

        [Column("fecha_actualizacion")]
        public DateTime FechaActualizacion { get; set; } = DateTime.Now;
    }
}
