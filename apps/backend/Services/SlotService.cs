using BookingApi.Models;

namespace BookingApi.Services;

public interface ISlotService
{
    Task GenerateSlotsAsync(Guid eventTypeId, int durationMinutes);
}

public class SlotService : ISlotService
{
    public async Task GenerateSlotsAsync(Guid eventTypeId, int durationMinutes)
    {
        // Slot generation logic
    }
}
