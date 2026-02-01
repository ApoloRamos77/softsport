using Microsoft.AspNetCore.Mvc;

namespace SoftSportAPI.Controllers
{
    public class FileUploadDto
    {
        public IFormFile File { get; set; } = null!;
    }

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
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Upload([FromForm] FileUploadDto model, [FromQuery] string type = "general")
        {
            var file = model.File;
            if (file == null || file.Length == 0)
                return BadRequest("No se ha proporcionado ningún archivo");

            // Validar extension
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                return BadRequest("Tipo de archivo no permitido. Use imágenes (jpg, png, webp)");

            // Asegurar que WebRootPath existe
            // Usamos GetCurrentDirectory() explícitamente para coincidir con la config de static files en Program.cs
            var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            
            // Log para debug
            Console.WriteLine($"[UPLOAD] Guardando archivo en root: {webRootPath}");
            
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
            var scheme = Request.Scheme;
            if (Request.Headers.ContainsKey("X-Forwarded-Proto"))
            {
                scheme = Request.Headers["X-Forwarded-Proto"].ToString();
            }
            
            var host = Request.Host.ToString();
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
