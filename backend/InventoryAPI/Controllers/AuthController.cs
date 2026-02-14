using Microsoft.AspNetCore.Mvc;
using InventoryAPI.Models;
using InventoryAPI.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly JwtService _jwtService;

        public AuthController(UserService userService, JwtService jwtService)
        {
            _userService = userService;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<object>> Register([FromBody] UserRegistrationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var user = await _userService.CreateAsync(request);
                
                return Ok(new { 
                    message = "User registered successfully", 
                    userId = user.Id,
                    username = user.Username,
                    email = user.Email
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] UserLoginRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var authResponse = await _userService.AuthenticateAsync(request);
                if (authResponse == null)
                    return Unauthorized(new { error = "Invalid username or password" });

                return Ok(authResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("refresh")]
        public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var authResponse = await _userService.RefreshTokenAsync(request.RefreshToken);
                if (authResponse == null)
                    return Unauthorized(new { error = "Invalid refresh token" });

                return Ok(authResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<ActionResult<object>> Logout()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return BadRequest(new { error = "Invalid user" });

                // Revoke all tokens for the user
                await _userService.RevokeAllTokensAsync(userId);

                return Ok(new { message = "Logged out successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("revoke-token")]
        [Authorize]
        public async Task<ActionResult<object>> RevokeToken([FromBody] RefreshTokenRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return BadRequest(new { error = "Invalid user" });

                var success = await _userService.RevokeTokenAsync(userId, request.RefreshToken);
                if (!success)
                    return BadRequest(new { error = "Invalid refresh token" });

                return Ok(new { message = "Token revoked successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserInfo>> GetCurrentUser()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return BadRequest(new { error = "Invalid user" });

                var user = await _userService.GetByIdAsync(userId);
                if (user == null)
                    return NotFound(new { error = "User not found" });

                var userInfo = new UserInfo
                {
                    Id = user.Id!,
                    Username = user.Username,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Role = user.Role
                };

                return Ok(userInfo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<ActionResult<object>> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return BadRequest(new { error = "Invalid user" });

                var success = await _userService.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);
                if (!success)
                    return BadRequest(new { error = "Invalid current password" });

                return Ok(new { message = "Password changed successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("public-key")]
        public ActionResult<object> GetPublicKey()
        {
            try
            {
                var publicKeyPem = _jwtService.GetPublicKeyPem();
                return Ok(new { publicKey = publicKeyPem });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("health")]
        public ActionResult<object> HealthCheck()
        {
            return Ok(new { 
                status = "Healthy", 
                timestamp = DateTime.UtcNow,
                service = "Authentication Service"
            });
        }

        [HttpPost("debug-validate")]
        public ActionResult<object> DebugValidateToken([FromBody] DebugTokenRequest request)
        {
            try
            {
                var principal = _jwtService.ValidateToken(request.Token);
                if (principal == null)
                {
                    return BadRequest(new { error = "Token validation failed" });
                }

                var claims = principal.Claims.Select(c => new { c.Type, c.Value }).ToList();
                return Ok(new { 
                    message = "Token is valid", 
                    claims = claims,
                    userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                    username = principal.FindFirst(ClaimTypes.Name)?.Value,
                    role = principal.FindFirst(ClaimTypes.Role)?.Value
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message, stackTrace = ex.StackTrace });
            }
        }
    }

    public class DebugTokenRequest
    {
        public string Token { get; set; } = string.Empty;
    }
}
