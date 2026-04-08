namespace BookingApi.Models;

public class CreateEventTypeRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int DurationMinutes { get; set; } = 30;
}
