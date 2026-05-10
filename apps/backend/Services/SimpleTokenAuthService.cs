using System.Collections.Concurrent;

namespace BookingApi.Services;

public class SimpleTokenAuthService : IAuthService
{
    private readonly IConfiguration _config;
    private static readonly ConcurrentDictionary<string, bool> _tokens = new();

    public SimpleTokenAuthService(IConfiguration config)
    {
        _config = config;
    }

    public string? Login(string username, string password)
    {
        var adminUser = _config["Admin:Username"] ?? "admin";
        var adminPass = _config["Admin:Password"] ?? "admin";

        if (username != adminUser || password != adminPass)
            return null;

        var token = Guid.NewGuid().ToString("N");
        _tokens[token] = true;
        return token;
    }

    public bool ValidateToken(string token)
    {
        return _tokens.TryGetValue(token, out var valid) && valid;
    }

    public void Logout(string token)
    {
        _tokens.TryRemove(token, out _);
    }
}
