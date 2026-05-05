namespace BookingApi.Models;

public class CreateBookingRequest
{
    public Guid EventTypeId { get; set; }
    public string SlotId { get; set; } = string.Empty;
    public string GuestName { get; set; } = string.Empty;
    public string GuestEmail { get; set; } = string.Empty;
}
