using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("contact_messages")]
    public class ContactMessage : AuditableEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("nombres")]
        [MaxLength(200)]
        public string Nombres { get; set; } = string.Empty;

        [Required]
        [Column("apellidos")]
        [MaxLength(200)]
        public string Apellidos { get; set; } = string.Empty;

        [Required]
        [Column("email")]
        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column("celular")]
        [MaxLength(50)]
        public string Celular { get; set; } = string.Empty;

        [Column("mensaje")]
        public string? Mensaje { get; set; }
    }
}
