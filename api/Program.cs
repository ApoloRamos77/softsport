using Microsoft.EntityFrameworkCore;
using SoftSportAPI.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure DbContext - Soporte para SQL Server y PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var usePostgres = builder.Configuration.GetValue<bool>("UsePostgreSQL", false);

// Enable legacy timestamp behavior for PostgreSQL to avoid DateTime Kind issues
if (usePostgres)
{
    AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
}

builder.Services.AddDbContext<SoftSportDbContext>(options =>
{
    if (usePostgres)
    {
        options.UseNpgsql(connectionString);
    }
    else
    {
        options.UseSqlServer(connectionString);
    }
});

// Add HttpContextAccessor for audit fields
builder.Services.AddHttpContextAccessor();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.WithOrigins(
                    "http://localhost:3000", 
                    "http://localhost:3001", 
                    "http://localhost:3002",
                    "http://172.16.11.92:3000", 
                    "http://172.16.11.92:3001",
                    "http://172.16.11.92:3002",
                    "http://10.255.237.16:3002",
                    "http://192.168.100.4:3002")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
        else
        {
            // En producción, permitir todos los orígenes de Easypanel
            policy.SetIsOriginAllowed(origin =>
                {
                    if (string.IsNullOrEmpty(origin)) return false;
                    var uri = new Uri(origin);
                    // Permitir localhost, easypanel.host, scuiaw.easypanel.host y cualquier subdominio
                    return uri.Host == "localhost" ||
                           uri.Host.EndsWith(".easypanel.host") ||
                           uri.Host.EndsWith(".scuiaw.easypanel.host");
                })
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
// Habilitar Swagger en todos los ambientes para facilitar testing
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "SoftSport API v1");
    c.RoutePrefix = "swagger"; // Accesible en /swagger
});

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

// Agregar endpoints básicos para health check y root
app.MapGet("/", () => new { 
    message = "ADHSOFT SPORT API - Bienvenido", 
    status = "running",
    environment = app.Environment.EnvironmentName,
    timestamp = DateTime.UtcNow 
});

app.MapGet("/health", () => new { 
    status = "healthy", 
    timestamp = DateTime.UtcNow 
});

app.Run();
