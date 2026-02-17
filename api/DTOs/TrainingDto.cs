using System.ComponentModel.DataAnnotations;

namespace SoftSportAPI.DTOs
{
    public class TrainingDto
    {
        public int? Id { get; set; }
        
        [Required]
        public string Titulo { get; set; } = string.Empty;
        
        public string? Descripcion { get; set; }
        public DateTime? Fecha { get; set; }
        public string? HoraInicio { get; set; }
        public string? HoraFin { get; set; }
        public string? Ubicacion { get; set; }
        public int? CategoriaId { get; set; }
        public int? EntrenadorId { get; set; }
        public string Estado { get; set; } = "Programado";
        public int? TrainingScheduleId { get; set; }
        public List<int>? CategoriaIds { get; set; }
    }
}
