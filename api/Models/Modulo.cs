namespace SoftSportAPI.Models
{
    public class Modulo
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Key { get; set; } = string.Empty; // Clave única para identificar el módulo (ej: 'dashboard', 'atletas')
        public string Grupo { get; set; } = string.Empty; // Para agrupar en el frontend (ej: 'Principal', 'Deportivo')
        public int Orden { get; set; }
        public bool Activo { get; set; } = true;
    }
}
