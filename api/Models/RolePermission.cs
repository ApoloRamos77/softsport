namespace SoftSportAPI.Models
{
    public class RolePermission
    {
        public int Id { get; set; }
        public int RoleId { get; set; }
        public int ModuloId { get; set; }
        public string ModuloNombre { get; set; } = string.Empty;
        public bool Ver { get; set; }
        public bool Crear { get; set; }
        public bool Modificar { get; set; }
        public bool Eliminar { get; set; }
        
        // Navegación
        [System.Text.Json.Serialization.JsonIgnore]
        public Role? Role { get; set; }
    }
}
