using Microsoft.EntityFrameworkCore;
using BookingApi.Data;
using BookingApi.Models;

namespace BookingApi.Services;

public interface ISlotService
{
    Task<IEnumerable<SlotDto>> GetSlotsAsync(Guid eventTypeId, DateTime date);
}

public class SlotDto
{
    public string Id { get; set; } = string.Empty;
    public string EventTypeId { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public bool IsAvailable { get; set; }
}

public class SlotService : ISlotService
{
    private readonly AppDbContext _context;

    public SlotService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<SlotDto>> GetSlotsAsync(Guid eventTypeId, DateTime date)
    {
        var eventType = await _context.EventTypes.FindAsync(eventTypeId);
        if (eventType == null)
        {
            return Array.Empty<SlotDto>();
        }

        var dayStart = date.Date.AddHours(9);  // 09:00
        var dayEnd = date.Date.AddHours(18);   // 18:00

        // Fetch all bookings that could overlap with this day's slots
        var bookings = await _context.Bookings
            .Where(b => b.StartTime < dayEnd && b.EndTime > dayStart)
            .ToListAsync();

        var slots = new List<SlotDto>();
        var current = dayStart;

        while (current < dayEnd)
        {
            var slotEnd = current.AddMinutes(eventType.DurationMinutes);
            if (slotEnd > dayEnd)
            {
                break;
            }

            var isAvailable = !bookings.Any(b =>
                b.StartTime < slotEnd && b.EndTime > current);

            slots.Add(new SlotDto
            {
                Id = current.ToString("O"),
                EventTypeId = eventTypeId.ToString(),
                StartTime = current,
                EndTime = slotEnd,
                IsAvailable = isAvailable
            });

            current = slotEnd;
        }

        // Mark 2-4 random available slots as busy to simulate occupancy
        var rng = new Random(date.Year * 10000 + date.Month * 100 + date.Day);
        var availableIndices = Enumerable.Range(0, slots.Count)
            .Where(i => slots[i].IsAvailable)
            .ToList();

        if (availableIndices.Count > 0)
        {
            var busyCount = Math.Min(rng.Next(2, 5), availableIndices.Count);
            var busyIndices = availableIndices.OrderBy(_ => rng.Next()).Take(busyCount).ToHashSet();
            foreach (var idx in busyIndices)
            {
                slots[idx].IsAvailable = false;
            }
        }

        return slots;
    }
}
