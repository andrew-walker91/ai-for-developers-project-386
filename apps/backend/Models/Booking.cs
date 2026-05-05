namespace BookingApi.Models;

public class Booking
{
    public Guid Id { get; set; }
    public Guid EventTypeId { get; set; }
    public string SlotId { get; set; } = string.Empty;
    public string GuestName { get; set; } = string.Empty;
    public string GuestEmail { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
}
