using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("periodos_pago")]
    public class PeriodoPago
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("alumno_id")]
        public int AlumnoId { get; set; }

        [Required]
        [Column("anio")]
        public int Anio { get; set; }

        [Required]
        [Column("mes")]
        public int Mes { get; set; }

        [Column("fecha_inicio")]
        public DateTime? FechaInicio { get; set; }

        [Column("fecha_vencimiento")]
        public DateTime? FechaVencimiento { get; set; }

        [Column("monto", TypeName = "decimal(12,2)")]
        public decimal Monto { get; set; } = 0;

        [Required]
        [Column("estado")]
        [MaxLength(50)]
        public string Estado { get; set; } = "Pendiente"; // Pendiente, Pagado, Vencido, Exonerado

        [Column("recibo_id")]
        public int? ReciboId { get; set; }

        [Column("observaciones")]
        public string? Observaciones { get; set; }

        [Column("fecha_creacion")]
        public DateTime? FechaCreacion { get; set; }

        [Column("usuario_creacion")]
        [MaxLength(100)]
        public string? UsuarioCreacion { get; set; }

        [Column("fecha_modificacion")]
        public DateTime? FechaModificacion { get; set; }

        [Column("usuario_modificacion")]
        [MaxLength(100)]
        public string? UsuarioModificacion { get; set; }

        // Navigation properties
        [ForeignKey("AlumnoId")]
        public Alumno? Alumno { get; set; }

        [ForeignKey("ReciboId")]
        public Recibo? Recibo { get; set; }
    }
}
