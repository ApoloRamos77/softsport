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
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
