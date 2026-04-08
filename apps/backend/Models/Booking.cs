namespace BookingApi.Models;

public class Booking
{
    public Guid Id { get; set; }
    public Guid EventTypeId { get; set; }
    public Guid SlotId { get; set; }
    public string GuestName { get; set; } = string.Empty;
    public string GuestEmail { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
