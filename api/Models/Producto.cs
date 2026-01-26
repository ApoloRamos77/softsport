using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("productos")]
    public class Producto : AuditableEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("nombre")]
        [MaxLength(150)]
        public string Nombre { get; set; } = string.Empty;

        [Column("sku")]
        [MaxLength(100)]
        public string? Sku { get; set; }

        [Column("descripcion")]
        [MaxLength(500)]
        public string? Descripcion { get; set; }

        [Required]
        [Column("precio", TypeName = "decimal(12,2)")]
        public decimal Precio { get; set; }

        [Required]
        [Column("cantidad")]
        public int Cantidad { get; set; }
    }
}
