using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("abonos")]
    public class Abono
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("recibo_id")]
        public int? ReciboId { get; set; }

        [Required]
        [Column("monto", TypeName = "decimal(12,2)")]
        public decimal Monto { get; set; }

        [Column("fecha")]
        public DateTime Fecha { get; set; } = DateTime.UtcNow;

        [Column("payment_method_id")]
        public int? PaymentMethodId { get; set; }

        [Column("referencia")]
        [MaxLength(200)]
        public string? Referencia { get; set; }

        // Navigation property
        [ForeignKey("ReciboId")]
        [System.Text.Json.Serialization.JsonIgnore]
        public Recibo? Recibo { get; set; }
    }
}
