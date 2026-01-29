using Microsoft.AspNetCore.Mvc;

namespace SoftSportAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FilesController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public FilesController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromQuery] string type = "general")
        {
            if (file == null || file.Length == 0)
                return BadRequest("No se ha proporcionado ningún archivo");

            // Validar extension
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                return BadRequest("Tipo de archivo no permitido. Use imágenes (jpg, png, webp)");

            // Asegurar que WebRootPath existe
            var webRootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            
            // Crear directorio si no existe
            var uploadsFolder = Path.Combine(webRootPath, "uploads", type);
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // Generar nombre archivo unico
            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            // Guardar
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Retornar URL
            // Determinar esquema correcto (http vs https) pensando en proxies
            var scheme = Request.Scheme;
            
            // Si hay header X-Forwarded-Proto, usarlo (aunque el middleware ya debería manejarlo)
            if (Request.Headers.ContainsKey("X-Forwarded-Proto"))
            {
                scheme = Request.Headers["X-Forwarded-Proto"].ToString();
            }
            
            var host = Request.Host.ToString();
            
            // Forzar HTTPS si estamos en easypanel (patch de seguridad visual)
            if (host.Contains("easypanel.host") && scheme == "http")
            {
                scheme = "https";
            }

            var baseUrl = $"{scheme}://{host}";
            var fileUrl = $"{baseUrl}/uploads/{type}/{fileName}";

            return Ok(new { url = fileUrl });
        }
    }
}
