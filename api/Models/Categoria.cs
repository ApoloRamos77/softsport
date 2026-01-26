using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("categorias")]
    public class Categoria : AuditableEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("nombre")]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Column("descripcion")]
        [MaxLength(500)]
        public string? Descripcion { get; set; }

        [Column("edad_min")]
        public int? EdadMin { get; set; }

        [Column("edad_max")]
        public int? EdadMax { get; set; }

        // Navigation property
        public ICollection<Alumno> Alumnos { get; set; } = new List<Alumno>();
    }
}
