using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RolesController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public RolesController(SoftSportDbContext context)
        {
            _context = context;
        }

        // GET: api/roles
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetRoles()
        {
            var roles = await _context.Roles
                .Select(r => new
                {
                    id = r.Id,
                    nombre = r.Nombre,
                    descripcion = r.Descripcion,
                    tipo = r.Tipo,
                    academia = r.Academia
                })
                .ToListAsync();

            return Ok(roles);
        }

        // GET: api/roles/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetRole(int id)
        {
            var role = await _context.Roles
                .Where(r => r.Id == id)
                .Select(r => new
                {
                    id = r.Id,
                    nombre = r.Nombre,
                    descripcion = r.Descripcion,
                    tipo = r.Tipo,
                    academia = r.Academia
                })
                .FirstOrDefaultAsync();

            if (role == null)
            {
                return NotFound();
            }

            return Ok(role);
        }

        // GET: api/roles/5/permissions
        [HttpGet("{id}/permissions")]
        public async Task<ActionResult<IEnumerable<object>>> GetRolePermissions(int id)
        {
            var permissions = await _context.RolePermissions
                .Where(p => p.RoleId == id)
                .Select(p => new
                {
                    moduloId = p.ModuloId,
                    moduloNombre = p.ModuloNombre,
                    ver = p.Ver,
                    crear = p.Crear,
                    modificar = p.Modificar,
                    eliminar = p.Eliminar
                })
                .ToListAsync();

            return Ok(permissions);
        }

        // POST: api/roles
        [HttpPost]
        public async Task<ActionResult<Role>> PostRole([FromBody] RoleDto roleDto)
        {
            var role = new Role
            {
                Nombre = roleDto.Nombre,
                Descripcion = roleDto.Descripcion,
                Tipo = roleDto.Tipo ?? "Sistema",
                Academia = roleDto.Academia,
                FechaCreacion = DateTime.Now
            };

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            // Guardar permisos
            if (roleDto.Permissions != null && roleDto.Permissions.Count > 0)
            {
                foreach (var perm in roleDto.Permissions)
                {
                    var rolePermission = new RolePermission
                    {
                        RoleId = role.Id,
                        ModuloId = perm.ModuloId,
                        ModuloNombre = perm.ModuloNombre,
                        Ver = perm.Ver,
                        Crear = perm.Crear,
                        Modificar = perm.Modificar,
                        Eliminar = perm.Eliminar
                    };
                    _context.RolePermissions.Add(rolePermission);
                }
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetRole), new { id = role.Id }, role);
        }

        // PUT: api/roles/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRole(int id, [FromBody] RoleDto roleDto)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null)
            {
                return NotFound();
            }

            role.Nombre = roleDto.Nombre;
            role.Descripcion = roleDto.Descripcion;
            role.Tipo = roleDto.Tipo ?? "Sistema";
            role.Academia = roleDto.Academia;
            role.FechaModificacion = DateTime.Now;

            // Eliminar permisos existentes
            var existingPermissions = await _context.RolePermissions
                .Where(p => p.RoleId == id)
                .ToListAsync();
            _context.RolePermissions.RemoveRange(existingPermissions);

            // Agregar nuevos permisos
            if (roleDto.Permissions != null && roleDto.Permissions.Count > 0)
            {
                foreach (var perm in roleDto.Permissions)
                {
                    var rolePermission = new RolePermission
                    {
                        RoleId = role.Id,
                        ModuloId = perm.ModuloId,
                        ModuloNombre = perm.ModuloNombre,
                        Ver = perm.Ver,
                        Crear = perm.Crear,
                        Modificar = perm.Modificar,
                        Eliminar = perm.Eliminar
                    };
                    _context.RolePermissions.Add(rolePermission);
                }
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/roles/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null)
            {
                return NotFound();
            }

            // Eliminar permisos asociados
            var permissions = await _context.RolePermissions
                .Where(p => p.RoleId == id)
                .ToListAsync();
            _context.RolePermissions.RemoveRange(permissions);

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    // DTO para recibir datos del cliente
    public class RoleDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string? Tipo { get; set; }
        public string? Academia { get; set; }
        public List<PermissionDto> Permissions { get; set; } = new List<PermissionDto>();
    }

    public class PermissionDto
    {
        public int ModuloId { get; set; }
        public string ModuloNombre { get; set; } = string.Empty;
        public bool Ver { get; set; }
        public bool Crear { get; set; }
        public bool Modificar { get; set; }
        public bool Eliminar { get; set; }
    }
}
