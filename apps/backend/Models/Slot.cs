namespace BookingApi.Models;

public class Slot
{
    public Guid Id { get; set; }
    public Guid EventTypeId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public bool IsAvailable { get; set; }
}
