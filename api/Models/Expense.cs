using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("expenses")]
    public class Expense : AuditableEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("descripcion")]
        [MaxLength(500)]
        public string? Descripcion { get; set; }

        [Required]
        [Column("monto", TypeName = "decimal(12,2)")]
        public decimal Monto { get; set; }

        [Column("fecha")]
        public DateTime Fecha { get; set; } = DateTime.UtcNow;

        [Column("categoria")]
        [MaxLength(150)]
        public string? Categoria { get; set; }

        [Column("referencia")]
        [MaxLength(200)]
        public string? Referencia { get; set; }

        [Column("estado")]
        [MaxLength(50)]
        public string Estado { get; set; } = "Activo";
    }
}
