using Microsoft.AspNetCore.Mvc;
using InventoryAPI.Models;
using InventoryAPI.Services;
// using Microsoft.AspNetCore.Authorization; // Temporarily commented out

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize] // Temporarily commented out for development
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;

        public UserController(UserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        // [Authorize(Roles = "Admin")] // Temporarily commented out for development
        public async Task<ActionResult<object>> GetAll()
        {
            try
            {
                var users = await _userService.GetAllAsync();
                var userInfos = users.Select(u => new UserInfo
                {
                    Id = u.Id!,
                    Username = u.Username,
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Role = u.Role
                });

                return Ok(new { data = userInfos, total = userInfos.Count() });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        // [Authorize(Roles = "Admin")] // Temporarily commented out for development
        public async Task<ActionResult<UserInfo>> GetById(string id)
        {
            try
            {
                var user = await _userService.GetByIdAsync(id);
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

        [HttpPut("{id}")]
        // [Authorize(Roles = "Admin")] // Temporarily commented out for development
        public async Task<ActionResult<object>> Update(string id, [FromBody] User user)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var success = await _userService.UpdateAsync(id, user);
                if (!success)
                    return NotFound(new { error = "User not found" });

                return Ok(new { message = "User updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        // [Authorize(Roles = "Admin")] // Temporarily commented out for development
        public async Task<ActionResult<object>> Delete(string id)
        {
            try
            {
                var success = await _userService.DeleteAsync(id);
                if (!success)
                    return NotFound(new { error = "User not found" });

                return Ok(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        // [Authorize(Roles = "Admin")] // Temporarily commented out for development
        public async Task<ActionResult<object>> Create([FromBody] UserRegistrationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var user = await _userService.CreateAsync(request);

                return Ok(new { 
                    message = "User created successfully", 
                    userId = user.Id,
                    username = user.Username,
                    email = user.Email,
                    role = user.Role
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

        [HttpPost("create-admin")]
        // [Authorize(Roles = "Admin")] // Temporarily commented out for development
        public async Task<ActionResult<object>> CreateAdmin([FromBody] UserRegistrationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var user = await _userService.CreateAsync(request);
                
                // Update role to Admin
                user.Role = "Admin";
                await _userService.UpdateAsync(user.Id!, user);

                return Ok(new { 
                    message = "Admin user created successfully", 
                    userId = user.Id,
                    username = user.Username,
                    email = user.Email,
                    role = user.Role
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

        [HttpGet("stats")]
        // [Authorize(Roles = "Admin")] // Temporarily commented out for development
        public async Task<ActionResult<object>> GetStats()
        {
            try
            {
                var users = await _userService.GetAllAsync();
                
                var stats = new
                {
                    TotalUsers = users.Count,
                    ActiveUsers = users.Count(u => u.IsActive),
                    AdminUsers = users.Count(u => u.Role == "Admin"),
                    RegularUsers = users.Count(u => u.Role == "User"),
                    ManagerUsers = users.Count(u => u.Role == "Manager"),
                    RecentRegistrations = users
                        .Where(u => u.CreatedAt >= DateTime.UtcNow.AddDays(-30))
                        .Count()
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
