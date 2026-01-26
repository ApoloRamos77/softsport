using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("accounting_entries")]
    public class AccountingEntry
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("tipo")]
        [MaxLength(50)]
        public string Tipo { get; set; } = string.Empty;

        [Column("descripcion")]
        [MaxLength(500)]
        public string? Descripcion { get; set; }

        [Required]
        [Column("monto", TypeName = "decimal(12,2)")]
        public decimal Monto { get; set; }

        [Column("fecha")]
        public DateTime Fecha { get; set; } = DateTime.UtcNow;

        [Column("referencia")]
        [MaxLength(200)]
        public string? Referencia { get; set; }
    }
}
