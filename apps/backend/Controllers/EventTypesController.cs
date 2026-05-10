using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookingApi.Data;
using BookingApi.Models;
using BookingApi.Services;

namespace BookingApi.Controllers;

[ApiController]
[Route("api/event-types")]
public class EventTypesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAuthService _auth;

    public EventTypesController(AppDbContext context, IAuthService auth)
    {
        _context = context;
        _auth = auth;
    }

    private bool IsAdminAuthorized()
    {
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        if (authHeader?.StartsWith("Bearer ") != true) return false;
        var token = authHeader["Bearer ".Length..];
        return _auth.ValidateToken(token);
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
        if (!IsAdminAuthorized())
        {
            return Unauthorized(new ErrorResponse { Status = 401, Code = "UNAUTHORIZED", Message = "Invalid or missing admin secret" });
        }

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
