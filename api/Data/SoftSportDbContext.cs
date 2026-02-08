using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Models;
using Microsoft.AspNetCore.Http;

namespace SoftSportAPI.Data
{
    public class SoftSportDbContext : DbContext
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public SoftSportDbContext(DbContextOptions<SoftSportDbContext> options, IHttpContextAccessor httpContextAccessor)
            : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        // DbSets
        public DbSet<User> Users { get; set; }
        public DbSet<Representante> Representantes { get; set; }
        public DbSet<Alumno> Alumnos { get; set; }
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Grupo> Grupos { get; set; }
        public DbSet<Beca> Becas { get; set; }
        public DbSet<Servicio> Servicios { get; set; }
        public DbSet<Producto> Productos { get; set; }
        public DbSet<PaymentMethod> PaymentMethods { get; set; }
        public DbSet<Recibo> Recibos { get; set; }
        public DbSet<ReciboItem> ReciboItems { get; set; }
        public DbSet<Abono> Abonos { get; set; }
        public DbSet<Season> Seasons { get; set; }
        public DbSet<Training> Trainings { get; set; }
        public DbSet<Game> Games { get; set; }
        public DbSet<TacticalBoard> TacticalBoards { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<AccountingEntry> AccountingEntries { get; set; }
        public DbSet<AlumnoBeca> AlumnoBecas { get; set; }
        public DbSet<GameAlumno> GameAlumnos { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<AcademyConfig> AcademyConfigs { get; set; }
        public DbSet<LandingGallery> LandingGalleries { get; set; }
        public DbSet<ContactMessage> ContactMessages { get; set; }
        public DbSet<HistorialMedico> HistorialMedico { get; set; }
        public DbSet<Bioquimica> Bioquimica { get; set; }
        public DbSet<PlanNutricional> PlanesNutricionales { get; set; }
        public DbSet<Suplementacion> Suplementaciones { get; set; }
        public DbSet<TrainingSchedule> TrainingSchedules { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships
            modelBuilder.Entity<Alumno>()
                .HasOne(a => a.Representante)
                .WithMany(r => r.Alumnos)
                .HasForeignKey(a => a.RepresentanteId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Alumno>()
                .HasOne(a => a.Grupo)
                .WithMany(g => g.Alumnos)
                .HasForeignKey(a => a.GrupoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Alumno>()
                .HasOne(a => a.Categoria)
                .WithMany(c => c.Alumnos)
                .HasForeignKey(a => a.CategoriaId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Alumno>()
                .HasOne(a => a.Beca)
                .WithMany(b => b.Alumnos)
                .HasForeignKey(a => a.BecaId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ReciboItem>()
                .HasOne(ri => ri.Recibo)
                .WithMany(r => r.Items)
                .HasForeignKey(ri => ri.ReciboId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Abono>()
                .HasOne(a => a.Recibo)
                .WithMany(r => r.Abonos)
                .HasForeignKey(a => a.ReciboId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<HistorialMedico>()
                .HasOne(h => h.Alumno)
                .WithMany()
                .HasForeignKey(h => h.AlumnoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Bioquimica>()
                .HasOne(b => b.Alumno)
                .WithMany()
                .HasForeignKey(b => b.AlumnoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PlanNutricional>()
                .HasOne(p => p.Alumno)
                .WithMany()
                .HasForeignKey(p => p.AlumnoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Suplementacion>()
                .HasOne(s => s.PlanNutricional)
                .WithMany(p => p.Suplementaciones)
                .HasForeignKey(s => s.PlanNutricionalId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure unique indexes
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker.Entries<AuditableEntity>();
            var currentUser = _httpContextAccessor?.HttpContext?.User?.Identity?.Name ?? "System";

            foreach (var entry in entries)
            {
                if (entry.State == EntityState.Added)
                {
                    // Solo llenar campos de creación
                    entry.Entity.FechaCreacion = DateTime.Now;
                    entry.Entity.UsuarioCreacion = currentUser;
                }
                else if (entry.State == EntityState.Modified)
                {
                    // Verificar si es una anulación (si FechaAnulacion fue establecida)
                    var isAnulacion = entry.Property(nameof(AuditableEntity.FechaAnulacion)).IsModified 
                                   && entry.Entity.FechaAnulacion != null;

                    if (isAnulacion)
                    {
                        // Solo actualizar campos de anulación, preservar creación y modificación
                        entry.Property(nameof(AuditableEntity.FechaCreacion)).IsModified = false;
                        entry.Property(nameof(AuditableEntity.UsuarioCreacion)).IsModified = false;
                        entry.Property(nameof(AuditableEntity.FechaModificacion)).IsModified = false;
                        entry.Property(nameof(AuditableEntity.UsuarioModificacion)).IsModified = false;
                        
                        entry.Entity.FechaAnulacion = DateTime.Now;
                        entry.Entity.UsuarioAnulacion = currentUser;
                    }
                    else
                    {
                        // Es una modificación normal, NO tocar campos de creación
                        entry.Property(nameof(AuditableEntity.FechaCreacion)).IsModified = false;
                        entry.Property(nameof(AuditableEntity.UsuarioCreacion)).IsModified = false;
                        
                        // Solo actualizar campos de modificación
                        entry.Entity.FechaModificacion = DateTime.Now;
                        entry.Entity.UsuarioModificacion = currentUser;
                    }
                }
                else if (entry.State == EntityState.Deleted)
                {
                    // En lugar de eliminar físicamente, marcamos como anulado (soft delete)
                    entry.State = EntityState.Modified;
                    
                    // NO tocar campos de creación ni modificación, solo anulación
                    entry.Property(nameof(AuditableEntity.FechaCreacion)).IsModified = false;
                    entry.Property(nameof(AuditableEntity.UsuarioCreacion)).IsModified = false;
                    entry.Property(nameof(AuditableEntity.FechaModificacion)).IsModified = false;
                    entry.Property(nameof(AuditableEntity.UsuarioModificacion)).IsModified = false;
                    
                    entry.Entity.FechaAnulacion = DateTime.Now;
                    entry.Entity.UsuarioAnulacion = currentUser;
                }
            }

            return base.SaveChangesAsync(cancellationToken);
        }    }
}