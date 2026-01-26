using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("recibos")]
    public class Recibo
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("numero")]
        [MaxLength(50)]
        public string? Numero { get; set; }

        [Column("destinatario_type")]
        [MaxLength(50)]
        public string? DestinatarioType { get; set; }

        [Column("destinatario_id")]
        public int? DestinatarioId { get; set; }

        [Column("fecha")]
        public DateTime Fecha { get; set; } = DateTime.UtcNow;

        [Required]
        [Column("subtotal", TypeName = "decimal(12,2)")]
        public decimal Subtotal { get; set; }

        [Required]
        [Column("descuento", TypeName = "decimal(12,2)")]
        public decimal Descuento { get; set; }

        [Required]
        [Column("total", TypeName = "decimal(12,2)")]
        public decimal Total { get; set; }

        [Required]
        [Column("estado")]
        [MaxLength(50)]
        public string Estado { get; set; } = "Pendiente";

        [Column("payment_method_id")]
        public int? PaymentMethodId { get; set; }

        [Column("created_by")]
        public int? CreatedBy { get; set; }

        // Navigation properties
        [ForeignKey("DestinatarioId")]
        public Alumno? Alumno { get; set; }
        public ICollection<ReciboItem> Items { get; set; } = new List<ReciboItem>();
        public ICollection<Abono> Abonos { get; set; } = new List<Abono>();
    }
}
