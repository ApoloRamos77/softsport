using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("training_categorias")]
    public class TrainingCategoria
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("training_id")]
        public int TrainingId { get; set; }

        [Required]
        [Column("categoria_id")]
        public int CategoriaId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation properties
        [ForeignKey("TrainingId")]
        public Training? Training { get; set; }

        [ForeignKey("CategoriaId")]
        public Categoria? Categoria { get; set; }
    }
}
