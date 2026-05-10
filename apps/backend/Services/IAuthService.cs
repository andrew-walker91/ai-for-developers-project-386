namespace BookingApi.Services;

public interface IAuthService
{
    string? Login(string username, string password);
    bool ValidateToken(string token);
    void Logout(string token);
}
