using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookingApi.Data;
using BookingApi.Models;
using BookingApi.Services;

namespace BookingApi.Controllers;

[ApiController]
[Route("api/bookings")]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ISlotService _slotService;
    private readonly IAuthService _auth;

    public BookingsController(AppDbContext context, ISlotService slotService, IAuthService auth)
    {
        _context = context;
        _slotService = slotService;
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
    public async Task<ActionResult<IEnumerable<Booking>>> GetAll()
    {
        if (!IsAdminAuthorized())
        {
            return Unauthorized(new ErrorResponse { Status = 401, Code = "UNAUTHORIZED", Message = "Invalid or missing admin secret" });
        }

        return await _context.Bookings.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Booking>> Create([FromBody] CreateBookingRequest request)
    {
        // Parse slotId as ISO datetime
        if (!DateTime.TryParse(request.SlotId, out var slotStart))
        {
            return BadRequest(new ErrorResponse { Status = 400, Code = "INVALID_SLOT", Message = "Invalid slot ID format" });
        }

        var eventType = await _context.EventTypes.FindAsync(request.EventTypeId);
        if (eventType == null)
        {
            return NotFound(new ErrorResponse { Status = 404, Code = "EVENT_TYPE_NOT_FOUND", Message = "Event type not found" });
        }

        var slotEnd = slotStart.AddMinutes(eventType.DurationMinutes);

        // Check global occupancy: any existing booking overlapping this time?
        var isTaken = await _context.Bookings.AnyAsync(b =>
            b.StartTime < slotEnd && b.EndTime > slotStart);

        if (isTaken)
        {
            return Conflict(new ErrorResponse { Status = 409, Code = "SLOT_TAKEN", Message = "Slot is already booked" });
        }

        // Validate working hours: 09:00-18:00
        var dayStart = slotStart.Date.AddHours(9);
        var dayEnd = slotStart.Date.AddHours(18);
        if (slotStart < dayStart || slotEnd > dayEnd)
        {
            return BadRequest(new ErrorResponse { Status = 400, Code = "OUTSIDE_WORKING_HOURS", Message = "Slot is outside working hours (09:00-18:00)" });
        }

        // Validate 14-day window
        var maxDate = DateTime.Now.Date.AddDays(14);
        if (slotStart.Date > maxDate)
        {
            return BadRequest(new ErrorResponse { Status = 400, Code = "TOO_FAR_IN_FUTURE", Message = "Booking window is 14 days from today" });
        }

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            EventTypeId = request.EventTypeId,
            SlotId = request.SlotId,
            GuestName = request.GuestName,
            GuestEmail = request.GuestEmail,
            CreatedAt = DateTime.UtcNow,
            StartTime = slotStart,
            EndTime = slotEnd
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = booking.Id }, booking);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!IsAdminAuthorized())
        {
            return Unauthorized(new ErrorResponse { Status = 401, Code = "UNAUTHORIZED", Message = "Invalid or missing admin secret" });
        }

        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null)
        {
            return NotFound(new ErrorResponse { Status = 404, Code = "NOT_FOUND", Message = "Booking not found" });
        }

        _context.Bookings.Remove(booking);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
