using MongoDB.Driver;
using MongoDB.Bson;
using InventoryAPI.Models;
using System.Security.Cryptography;
using System.Text;

namespace InventoryAPI.Services
{
    public class UserService
    {
        private readonly IMongoCollection<User> _users;
        private readonly JwtService _jwtService;

        public UserService(DatabaseService databaseService, JwtService jwtService)
        {
            _users = databaseService.Users;
            _jwtService = jwtService;
        }

        public async Task<List<User>> GetAllAsync()
        {
            return await _users.Find(u => u.IsActive).SortByDescending(u => u.CreatedAt).ToListAsync();
        }

        public async Task<User?> GetByIdAsync(string id)
        {
            return await _users.Find(u => u.Id == id && u.IsActive).FirstOrDefaultAsync();
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _users.Find(u => u.Username == username && u.IsActive).FirstOrDefaultAsync();
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _users.Find(u => u.Email == email && u.IsActive).FirstOrDefaultAsync();
        }

        public async Task<User> CreateAsync(UserRegistrationRequest request)
        {
            // Check if username or email already exists
            var existingUser = await _users.Find(u => 
                (u.Username == request.Username || u.Email == request.Email) && u.IsActive
            ).FirstOrDefaultAsync();

            if (existingUser != null)
            {
                if (existingUser.Username == request.Username)
                    throw new InvalidOperationException("Username already exists");
                if (existingUser.Email == request.Email)
                    throw new InvalidOperationException("Email already exists");
            }

            var user = new User
            {
                Username = request.Username,
                PasswordHash = HashPassword(request.Password),
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Role = "User", // Default role
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _users.InsertOneAsync(user);
            return user;
        }

        public async Task<bool> UpdateAsync(string id, User user)
        {
            user.Id = id;
            user.UpdatedAt = DateTime.UtcNow;

            var result = await _users.ReplaceOneAsync(u => u.Id == id, user);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var update = Builders<User>.Update.Set(u => u.IsActive, false);
            var result = await _users.UpdateOneAsync(u => u.Id == id, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword)
        {
            var user = await GetByIdAsync(userId);
            if (user == null)
                return false;

            if (!VerifyPassword(currentPassword, user.PasswordHash))
                return false;

            var newPasswordHash = HashPassword(newPassword);
            var update = Builders<User>.Update
                .Set(u => u.PasswordHash, newPasswordHash)
                .Set(u => u.UpdatedAt, DateTime.UtcNow);

            var result = await _users.UpdateOneAsync(u => u.Id == userId, update);
            return result.ModifiedCount > 0;
        }

        public async Task<AuthResponse?> AuthenticateAsync(UserLoginRequest request)
        {
            var user = await GetByUsernameAsync(request.Username);
            if (user == null)
                return null;

            if (!VerifyPassword(request.Password, user.PasswordHash))
                return null;

            // Update last login
            var update = Builders<User>.Update
                .Set(u => u.LastLoginAt, DateTime.UtcNow);
            await _users.UpdateOneAsync(u => u.Id == user.Id, update);

            // Generate tokens
            var accessToken = _jwtService.GenerateAccessToken(user);
            var refreshToken = _jwtService.GenerateRefreshToken();

            // Add refresh token to user
            _jwtService.AddRefreshToken(user, refreshToken);
            await UpdateAsync(user.Id!, user);

            return new AuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15), // 15 minutes
                TokenType = "Bearer",
                User = new UserInfo
                {
                    Id = user.Id!,
                    Username = user.Username,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Role = user.Role
                }
            };
        }

        public async Task<AuthResponse?> RefreshTokenAsync(string refreshToken)
        {
            var user = await _users.Find(u => u.RefreshTokens.Contains(refreshToken) && u.IsActive).FirstOrDefaultAsync();
            if (user == null)
                return null;

            // Remove old refresh token
            _jwtService.RemoveRefreshToken(user, refreshToken);

            // Generate new tokens
            var newAccessToken = _jwtService.GenerateAccessToken(user);
            var newRefreshToken = _jwtService.GenerateRefreshToken();

            // Add new refresh token to user
            _jwtService.AddRefreshToken(user, newRefreshToken);
            await UpdateAsync(user.Id!, user);

            return new AuthResponse
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15), // 15 minutes
                TokenType = "Bearer",
                User = new UserInfo
                {
                    Id = user.Id!,
                    Username = user.Username,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Role = user.Role
                }
            };
        }

        public async Task<bool> RevokeTokenAsync(string userId, string refreshToken)
        {
            var user = await GetByIdAsync(userId);
            if (user == null)
                return false;

            _jwtService.RemoveRefreshToken(user, refreshToken);
            await UpdateAsync(userId, user);
            return true;
        }

        public async Task<bool> RevokeAllTokensAsync(string userId)
        {
            var user = await GetByIdAsync(userId);
            if (user == null)
                return false;

            _jwtService.RevokeAllRefreshTokens(user);
            await UpdateAsync(userId, user);
            return true;
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        private bool VerifyPassword(string password, string hash)
        {
            var hashedPassword = HashPassword(password);
            return hashedPassword == hash;
        }

        public async Task CreateDefaultAdminUserAsync()
        {
            var existingAdmin = await GetByUsernameAsync("admin");
            if (existingAdmin == null)
            {
                var adminUser = new User
                {
                    Username = "admin",
                    PasswordHash = HashPassword("admin123"),
                    Email = "admin@inventory.com",
                    FirstName = "System",
                    LastName = "Administrator",
                    Role = "Admin",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _users.InsertOneAsync(adminUser);
                Console.WriteLine("Default admin user created: admin/admin123");
            }
        }
    }
}
