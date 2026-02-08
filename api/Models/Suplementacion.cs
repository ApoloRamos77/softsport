using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("suplementacion")]
    public class Suplementacion : AuditableEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("plan_nutricional_id")]
        public int PlanNutricionalId { get; set; }

        [Required]
        [Column("producto")]
        [MaxLength(100)]
        public string Producto { get; set; } = string.Empty;

        [Column("dosis")]
        [MaxLength(100)]
        public string? Dosis { get; set; }

        [Column("momento")]
        [MaxLength(100)]
        public string? Momento { get; set; }

        [Column("observaciones")]
        public string? Observaciones { get; set; }

        // Navigation property
        [ForeignKey("PlanNutricionalId")]
        public PlanNutricional? PlanNutricional { get; set; }
    }
}
