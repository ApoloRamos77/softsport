using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;
using SoftSportAPI.Models;

namespace SoftSportAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ModulesController : ControllerBase
    {
        private readonly SoftSportDbContext _context;

        public ModulesController(SoftSportDbContext context)
        {
            _context = context;
        }

        // GET: api/Modules
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Modulo>>> GetModules()
        {
            return await _context.Modulos
                .Where(m => m.Activo)
                .OrderBy(m => m.Orden)
                .ToListAsync();
        }
    }
}
