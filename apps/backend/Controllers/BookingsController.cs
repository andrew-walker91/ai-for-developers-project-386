using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookingApi.Data;
using BookingApi.Models;

namespace BookingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public BookingsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Booking>>> GetAll()
    {
        return await _context.Bookings.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Booking>> Create([FromBody] CreateBookingRequest request)
    {
        var slot = await _context.Slots.FindAsync(request.SlotId);
        if (slot == null)
        {
            return NotFound(new ErrorResponse { Status = 404, Code = "SLOT_NOT_FOUND", Message = "Slot not found" });
        }

        if (!slot.IsAvailable)
        {
            return Conflict(new ErrorResponse { Status = 409, Code = "SLOT_TAKEN", Message = "Slot is already booked" });
        }

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            EventTypeId = request.EventTypeId,
            SlotId = request.SlotId,
            GuestName = request.GuestName,
            GuestEmail = request.GuestEmail,
            CreatedAt = DateTime.UtcNow
        };

        slot.IsAvailable = false;
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = booking.Id }, booking);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null)
        {
            return NotFound(new ErrorResponse { Status = 404, Code = "NOT_FOUND", Message = "Booking not found" });
        }

        var slot = await _context.Slots.FindAsync(booking.SlotId);
        if (slot != null)
        {
            slot.IsAvailable = true;
        }

        _context.Bookings.Remove(booking);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
