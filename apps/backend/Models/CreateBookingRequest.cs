namespace BookingApi.Models;

public class CreateBookingRequest
{
    public Guid EventTypeId { get; set; }
    public Guid SlotId { get; set; }
    public string GuestName { get; set; } = string.Empty;
    public string GuestEmail { get; set; } = string.Empty;
}
