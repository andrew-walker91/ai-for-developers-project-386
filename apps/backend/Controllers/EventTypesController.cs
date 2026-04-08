using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookingApi.Data;
using BookingApi.Models;

namespace BookingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventTypesController : ControllerBase
{
    private readonly AppDbContext _context;

    public EventTypesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EventType>>> GetAll()
    {
        return await _context.EventTypes.ToListAsync();
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EventType>> GetById(Guid id)
    {
        var eventType = await _context.EventTypes.FindAsync(id);
        if (eventType == null)
        {
            return NotFound(new ErrorResponse { Status = 404, Code = "NOT_FOUND", Message = "Event type not found" });
        }
        return eventType;
    }

    [HttpPost]
    public async Task<ActionResult<EventType>> Create([FromBody] CreateEventTypeRequest request)
    {
        if (request.DurationMinutes < 5)
        {
            return BadRequest(new ErrorResponse { Status = 400, Code = "INVALID_DURATION", Message = "Duration must be at least 5 minutes" });
        }

        var eventType = new EventType
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            DurationMinutes = request.DurationMinutes
        };

        _context.EventTypes.Add(eventType);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = eventType.Id }, eventType);
    }
}
