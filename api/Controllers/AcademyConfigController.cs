using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AcademyConfigController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public AcademyConfigController(SoftSportDbContext context)
        {
            _context = context;
        }

        // GET: api/AcademyConfig
        [HttpGet]
        public async Task<ActionResult<AcademyConfig>> GetConfig()
        {
            try
            {
                var config = await _context.Set<AcademyConfig>().FirstOrDefaultAsync();
                
                if (config == null)
                {
                    // Create default config if doesn't exist
                    config = new AcademyConfig
                    {
                        Nombre = "Mi Academia",
                        Email = "email@academia.com",
                        Telefono = "+51977816213",
                        Direccion = "",
                        ColorMenu = "#1a73e8",
                        ColorBotones = "#0B66FF",
                        WhatsAppActivado = false,
                        PartidasActivado = false
                    };
                    _context.Set<AcademyConfig>().Add(config);
                    await _context.SaveChangesAsync();
                }

                return Ok(config);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // PUT: api/AcademyConfig
        [HttpPut]
        public async Task<IActionResult> UpdateConfig(AcademyConfig academyConfig)
        {
            try
            {
                var existingConfig = await _context.Set<AcademyConfig>().FirstOrDefaultAsync();
                
                if (existingConfig == null)
                {
                    academyConfig.FechaActualizacion = DateTime.Now;
                    _context.Set<AcademyConfig>().Add(academyConfig);
                }
                else
                {
                    existingConfig.Nombre = academyConfig.Nombre;
                    existingConfig.Email = academyConfig.Email;
                    existingConfig.Telefono = academyConfig.Telefono;
                    existingConfig.Direccion = academyConfig.Direccion;
                    existingConfig.LogoUrl = academyConfig.LogoUrl;
                    existingConfig.ColorMenu = academyConfig.ColorMenu;
                    existingConfig.ColorBotones = academyConfig.ColorBotones;
                    existingConfig.WhatsAppActivado = academyConfig.WhatsAppActivado;
                    existingConfig.PartidasActivado = academyConfig.PartidasActivado;
                    existingConfig.FechaActualizacion = DateTime.Now;
                    
                    _context.Entry(existingConfig).State = EntityState.Modified;
                }

                await _context.SaveChangesAsync();
                return Ok(existingConfig ?? academyConfig);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
