using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using InventoryAPI.Models;

namespace InventoryAPI.Services
{
    public class JwtService
    {
        private readonly RSA _rsaPrivateKey;
        private readonly RSA _rsaPublicKey;
        private readonly string _issuer;
        private readonly string _audience;
        private readonly int _accessTokenExpiryMinutes;
        private readonly int _refreshTokenExpiryDays;

        public JwtService(IConfiguration configuration)
        {
            _issuer = configuration["Jwt:Issuer"] ?? "InventoryAPI";
            _audience = configuration["Jwt:Audience"] ?? "InventoryApp";
            _accessTokenExpiryMinutes = int.Parse(configuration["Jwt:AccessTokenExpiryMinutes"] ?? "15");
            _refreshTokenExpiryDays = int.Parse(configuration["Jwt:RefreshTokenExpiryDays"] ?? "7");

            // Generate or load RSA key pair
            (_rsaPrivateKey, _rsaPublicKey) = GenerateOrLoadRsaKeys();
        }

        private (RSA privateKey, RSA publicKey) GenerateOrLoadRsaKeys()
        {
            var privateKeyPath = "private-key.pem";
            var publicKeyPath = "public-key.pem";

            if (File.Exists(privateKeyPath) && File.Exists(publicKeyPath))
            {
                // Load existing keys
                var privateKeyText = File.ReadAllText(privateKeyPath);
                var publicKeyText = File.ReadAllText(publicKeyPath);

                var privateKey = RSA.Create();
                var publicKey = RSA.Create();

                privateKey.ImportFromPem(privateKeyText);
                publicKey.ImportFromPem(publicKeyText);

                return (privateKey, publicKey);
            }
            else
            {
                // Generate new keys
                var privateKey = RSA.Create(2048);
                var publicKey = RSA.Create();
                publicKey.ImportRSAPublicKey(privateKey.ExportRSAPublicKey(), out _);

                // Save keys to files
                var privateKeyPem = privateKey.ExportPkcs8PrivateKeyPem();
                var publicKeyPem = publicKey.ExportSubjectPublicKeyInfoPem();

                File.WriteAllText(privateKeyPath, privateKeyPem);
                File.WriteAllText(publicKeyPath, publicKeyPem);

                Console.WriteLine($"RSA key pair generated and saved:");
                Console.WriteLine($"Private key: {privateKeyPath}");
                Console.WriteLine($"Public key: {publicKeyPath}");

                return (privateKey, publicKey);
            }
        }

        public string GenerateAccessToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id!),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("FirstName", user.FirstName),
                new Claim("LastName", user.LastName)
            };

            var credentials = new SigningCredentials(
                new RsaSecurityKey(_rsaPrivateKey),
                SecurityAlgorithms.RsaSha256
            );

            var token = new JwtSecurityToken(
                issuer: _issuer,
                audience: _audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_accessTokenExpiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public ClaimsPrincipal? ValidateToken(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new RsaSecurityKey(_rsaPublicKey),
                    ValidateIssuer = true,
                    ValidIssuer = _issuer,
                    ValidateAudience = true,
                    ValidAudience = _audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
                return principal;
            }
            catch
            {
                return null;
            }
        }

        public bool ValidateRefreshToken(string refreshToken, User user)
        {
            return user.RefreshTokens.Contains(refreshToken);
        }

        public void AddRefreshToken(User user, string refreshToken)
        {
            user.RefreshTokens.Add(refreshToken);
            
            // Keep only the last 5 refresh tokens
            if (user.RefreshTokens.Count > 5)
            {
                user.RefreshTokens.RemoveAt(0);
            }
        }

        public void RemoveRefreshToken(User user, string refreshToken)
        {
            user.RefreshTokens.Remove(refreshToken);
        }

        public void RevokeAllRefreshTokens(User user)
        {
            user.RefreshTokens.Clear();
        }

        public RSA GetPublicKey()
        {
            return _rsaPublicKey;
        }

        public string GetPublicKeyPem()
        {
            return _rsaPublicKey.ExportSubjectPublicKeyInfoPem();
        }
    }
}
