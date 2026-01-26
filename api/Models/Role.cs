namespace SoftSportAPI.Models
{
    public class Role
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string Tipo { get; set; } = "Sistema"; // Sistema, Personalizado
        public string? Academia { get; set; }
        public DateTime FechaCreacion { get; set; } = DateTime.Now;
        public DateTime? FechaModificacion { get; set; }
        
        // Relación con permisos
        public ICollection<RolePermission> Permissions { get; set; } = new List<RolePermission>();
    }
}
