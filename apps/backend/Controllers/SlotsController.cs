using Microsoft.AspNetCore.Mvc;
using BookingApi.Models;
using BookingApi.Services;

namespace BookingApi.Controllers;

[ApiController]
[Route("api/slots")]
public class SlotsController : ControllerBase
{
    private readonly ISlotService _slotService;

    public SlotsController(ISlotService slotService)
    {
        _slotService = slotService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SlotDto>>> GetSlots(
        [FromQuery] Guid eventTypeId,
        [FromQuery] string date)
    {
        if (!DateTime.TryParse(date, out var parsedDate))
        {
            return BadRequest(new ErrorResponse { Status = 400, Code = "INVALID_DATE", Message = "Invalid date format. Use YYYY-MM-DD or ISO format." });
        }

        var slots = await _slotService.GetSlotsAsync(eventTypeId, parsedDate);
        return Ok(slots);
    }
}
