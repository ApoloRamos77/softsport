using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSportAPI.Models
{
    [Table("alumnos")]
    public class Alumno : AuditableEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("nombre")]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [Column("apellido")]
        [MaxLength(100)]
        public string Apellido { get; set; } = string.Empty;

        [Column("documento")]
        [MaxLength(50)]
        public string? Documento { get; set; }

        [Column("fecha_nacimiento")]
        public DateTime? FechaNacimiento { get; set; }

        [Column("telefono")]
        [MaxLength(50)]
        public string? Telefono { get; set; }

        [Column("email")]
        [MaxLength(255)]
        public string? Email { get; set; }

        [Column("posicion")]
        [MaxLength(50)]
        public string? Posicion { get; set; }

        [Column("numero_camiseta")]
        public int? NumeroCamiseta { get; set; }

        [Column("grupo_id")]
        public int? GrupoId { get; set; }

        [Column("categoria_id")]
        public int? CategoriaId { get; set; }

        [Column("beca_id")]
        public int? BecaId { get; set; }

        [Column("estado")]
        [MaxLength(50)]
        public string Estado { get; set; } = "Activo";

        [Column("fecha_registro")]
        public DateTime FechaRegistro { get; set; } = DateTime.Now;

        [Column("representante_id")]
        public int? RepresentanteId { get; set; }

        // Campos adicionales de información básica
        [Column("sexo")]
        [MaxLength(1)]
        public string? Sexo { get; set; }

        [Column("fotografia")]
        [MaxLength(500)]
        public string? Fotografia { get; set; }

        [Column("codigopais")]
        [MaxLength(5)]
        public string? CodigoPais { get; set; }

        [Column("direccion")]
        [MaxLength(500)]
        public string? Direccion { get; set; }

        [Column("colegio")]
        [MaxLength(200)]
        public string? Colegio { get; set; }

        // Segundo representante (opcional)
        [Column("segundorepresentantenombre")]
        [MaxLength(200)]
        public string? SegundoRepresentanteNombre { get; set; }

        [Column("segundorepresentanteparentesco")]
        [MaxLength(100)]
        public string? SegundoRepresentanteParentesco { get; set; }

        [Column("segundorepresentantecodigo")]
        [MaxLength(5)]
        public string? SegundoRepresentanteCodigo { get; set; }

        [Column("segundorepresentantetelefono")]
        [MaxLength(20)]
        public string? SegundoRepresentanteTelefono { get; set; }

        [Column("segundorepresentanteemail")]
        [MaxLength(200)]
        public string? SegundoRepresentanteEmail { get; set; }

        // Campos médicos
        [Column("tiposangre")]
        [MaxLength(5)]
        public string? TipoSangre { get; set; }

        [Column("alergias")]
        [MaxLength(200)]
        public string? Alergias { get; set; }

        [Column("condicionesmedicas")]
        public string? CondicionesMedicas { get; set; }

        [Column("medicamentos")]
        public string? Medicamentos { get; set; }

        [Column("contactoemergencia")]
        [MaxLength(200)]
        public string? ContactoEmergencia { get; set; }

        [Column("codigopaisemergencia")]
        [MaxLength(5)]
        public string? CodigoPaisEmergencia { get; set; }

        [Column("telefonoemergencia")]
        [MaxLength(20)]
        public string? TelefonoEmergencia { get; set; }

        // Campos administrativos
        [Column("notas")]
        public string? Notas { get; set; }

        // Campos de Gestión Nutricional
        [Column("horario_entrenamiento")]
        [MaxLength(200)]
        public string? HorarioEntrenamiento { get; set; }

        [Column("intolerancias")]
        [MaxLength(200)]
        public string? Intolerancias { get; set; }

        [Column("horas_sueno")]
        public decimal? HorasSueno { get; set; }

        [Column("agua_diaria")]
        [MaxLength(50)]
        public string? AguaDiaria { get; set; }

        [Column("digestion")]
        [MaxLength(50)]
        public string? Digestion { get; set; }

        [Column("lesiones_recientes")]
        public string? LesionesRecientes { get; set; }

        // Navigation properties
        [ForeignKey("RepresentanteId")]
        public Representante? Representante { get; set; }

        [ForeignKey("GrupoId")]
        public Grupo? Grupo { get; set; }

        [ForeignKey("CategoriaId")]
        public Categoria? Categoria { get; set; }

        [ForeignKey("BecaId")]
        public Beca? Beca { get; set; }
    }
}
