using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;
using BCrypt.Net;
using System.Linq;
using System.Collections.Generic;

namespace SoftSportAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public AuthController(SoftSportDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            try
            {
                // Find user by email
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null)
                {
                    return Unauthorized(new { error = "Credenciales inválidas" });
                }

                // Verify password using BCrypt
                if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                {
                    return Unauthorized(new { error = "Credenciales inválidas" });
                }

                // Check if user is active
                if (!user.Active)
                {
                    return Unauthorized(new { error = "Usuario inactivo. Contacta al administrador." });
                }

                // Get role with permissions
                var roleEntity = await _context.Roles
                    .Include(r => r.Permissions)
                    .FirstOrDefaultAsync(r => r.Nombre == user.Role);

                var permissions = new List<AuthPermissionDto>();

                if (roleEntity != null && roleEntity.Permissions != null)
                {
                    // Fetch all active modules for mapping keys
                    var modules = await _context.Modulos.Where(m => m.Activo).ToListAsync();

                    permissions = roleEntity.Permissions.Select(p => 
                    {
                        var module = modules.FirstOrDefault(m => m.Id == p.ModuloId);
                        return new AuthPermissionDto
                        {
                            ModuloId = p.ModuloId,
                            ModuloKey = module?.Key ?? "",
                            ModuloNombre = module?.Nombre ?? p.ModuloNombre,
                            Ver = p.Ver,
                            Crear = p.Crear,
                            Modificar = p.Modificar,
                            Eliminar = p.Eliminar
                        };
                    }).ToList();
                }

                // Return user data (excluding password)
                var response = new LoginResponse
                {
                    Id = user.Id,
                    Nombre = user.Nombre,
                    Apellido = user.Apellido,
                    Email = user.Email,
                    Role = user.Role,
                    Telefono = user.Telefono,
                    Permissions = permissions
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? Telefono { get; set; }
        public List<AuthPermissionDto> Permissions { get; set; } = new List<AuthPermissionDto>();
    }

    public class AuthPermissionDto
    {
        public int ModuloId { get; set; }
        public string ModuloKey { get; set; } = string.Empty;
        public string ModuloNombre { get; set; } = string.Empty;
        public bool Ver { get; set; }
        public bool Crear { get; set; }
        public bool Modificar { get; set; }
        public bool Eliminar { get; set; }
    }
}
