using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("payment_methods")]
    public class PaymentMethod : AuditableEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("nombre")]
        [MaxLength(150)]
        public string Nombre { get; set; } = string.Empty;

        [Column("descripcion")]
        [MaxLength(500)]
        public string? Descripcion { get; set; }

        [Column("currency")]
        [MaxLength(10)]
        public string? Currency { get; set; }

        [Column("activo")]
        public bool Activo { get; set; } = true;
    }
}
