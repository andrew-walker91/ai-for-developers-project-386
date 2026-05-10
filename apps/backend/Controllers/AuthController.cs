using Microsoft.AspNetCore.Mvc;
using BookingApi.Models;
using BookingApi.Services;

namespace BookingApi.Controllers;

[ApiController]
[Route("api/admin")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("login")]
    public ActionResult Login([FromBody] LoginRequest request)
    {
        var token = _auth.Login(request.Username, request.Password);
        if (token == null)
            return Unauthorized(new ErrorResponse { Status = 401, Code = "UNAUTHORIZED", Message = "Invalid credentials" });
        return Ok(new { token });
    }

    [HttpPost("logout")]
    public ActionResult Logout()
    {
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        if (authHeader?.StartsWith("Bearer ") == true)
            _auth.Logout(authHeader["Bearer ".Length..]);
        return Ok();
    }
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
