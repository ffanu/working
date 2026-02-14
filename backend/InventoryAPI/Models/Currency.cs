using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Models
{
    public class Currency
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        [StringLength(10)]
        public string Code { get; set; } = string.Empty; // USD, EUR, GBP, INR, etc.

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty; // US Dollar, Euro, British Pound

        [Required]
        [StringLength(5)]
        public string Symbol { get; set; } = string.Empty; // $, €, £, ₹

        public decimal ExchangeRate { get; set; } = 1.0m; // Rate relative to base currency

        public bool IsBaseCurrency { get; set; } = false; // Primary currency for the system

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class ExchangeRate
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string FromCurrencyId { get; set; } = string.Empty;

        [Required]
        public string ToCurrencyId { get; set; } = string.Empty;

        public decimal Rate { get; set; } = 1.0m;

        public DateTime EffectiveDate { get; set; } = DateTime.UtcNow;

        public DateTime? ExpiryDate { get; set; } = null;

        [StringLength(100)]
        public string Source { get; set; } = string.Empty; // Manual, API, etc.

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;
    }
}


