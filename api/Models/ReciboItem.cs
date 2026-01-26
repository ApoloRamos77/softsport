using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("recibo_items")]
    public class ReciboItem
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("recibo_id")]
        public int ReciboId { get; set; }

        [Required]
        [Column("tipo")]
        [MaxLength(20)]
        public string Tipo { get; set; } = string.Empty;

        [Column("item_id")]
        public int? ItemId { get; set; }

        [Column("descripcion")]
        [MaxLength(500)]
        public string? Descripcion { get; set; }

        [Required]
        [Column("precio_unitario", TypeName = "decimal(12,2)")]
        public decimal PrecioUnitario { get; set; }

        [Required]
        [Column("cantidad")]
        public int Cantidad { get; set; } = 1;

        [Required]
        [Column("total", TypeName = "decimal(12,2)")]
        public decimal Total { get; set; }

        // Navigation property
        [ForeignKey("ReciboId")]
        public Recibo? Recibo { get; set; }
    }
}
