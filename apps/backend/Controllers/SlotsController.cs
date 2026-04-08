using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookingApi.Data;
using BookingApi.Models;

namespace BookingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SlotsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SlotsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Slot>>> GetSlots([FromQuery] Guid eventTypeId, [FromQuery] string date)
    {
        if (!DateTime.TryParse(date, out var parsedDate))
        {
            return BadRequest(new ErrorResponse { Status = 400, Code = "INVALID_DATE", Message = "Invalid date format" });
        }

        var startOfDay = parsedDate.Date;
        var endOfDay = startOfDay.AddDays(1);

        var slots = await _context.Slots
            .Where(s => s.EventTypeId == eventTypeId && s.StartTime >= startOfDay && s.StartTime < endOfDay)
            .ToListAsync();

        return slots;
    }
}
