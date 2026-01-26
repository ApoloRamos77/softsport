using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    /// <summary>
    /// Clase base que contiene las propiedades de auditoría para todas las entidades
    /// </summary>
    public abstract class AuditableEntity
    {
        [Column("fecha_creacion")]
        public DateTime? FechaCreacion { get; set; }

        [Column("usuario_creacion")]
        public string? UsuarioCreacion { get; set; }

        [Column("fecha_modificacion")]
        public DateTime? FechaModificacion { get; set; }

        [Column("usuario_modificacion")]
        public string? UsuarioModificacion { get; set; }

        [Column("fecha_anulacion")]
        public DateTime? FechaAnulacion { get; set; }

        [Column("usuario_anulacion")]
        public string? UsuarioAnulacion { get; set; }
    }
}
