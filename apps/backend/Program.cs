using Microsoft.EntityFrameworkCore;
using BookingApi.Data;
using BookingApi.Models;
using BookingApi.Services;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls($"http://+:{port}");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=bookings.db"));

builder.Services.AddScoped<ISlotService, SlotService>();

builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("database");

var app = builder.Build();

// Ensure database is created and seed default data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    var defaultEventTypes = new[]
    {
        new EventType
        {
            Name = "Консультация",
            Description = "Персональная консультация по любым вопросам",
            DurationMinutes = 30
        },
        new EventType
        {
            Name = "Глубокое интервью",
            Description = "Подробный разбор ситуации и планирование",
            DurationMinutes = 60
        },
        new EventType
        {
            Name = "Стратегическая сессия",
            Description = "Долгая встреча для стратегического планирования",
            DurationMinutes = 90
        }
    };

    foreach (var defaultEventType in defaultEventTypes)
    {
        var exists = db.EventTypes.Any(eventType => eventType.Name == defaultEventType.Name);
        if (exists)
        {
            continue;
        }

        db.EventTypes.Add(new EventType
        {
            Id = Guid.NewGuid(),
            Name = defaultEventType.Name,
            Description = defaultEventType.Description,
            DurationMinutes = defaultEventType.DurationMinutes
        });
    }

    if (db.ChangeTracker.HasChanges())
    {
        db.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

app.UseStaticFiles();
app.UseDefaultFiles();
app.MapFallbackToFile("index.html");

app.Run();
