using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Models
{
    public class CustomerLedger
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string CustomerId { get; set; } = string.Empty;

        [StringLength(100)]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        public string TransactionId { get; set; } = string.Empty; // Sale ID

        [Required]
        public string TransactionType { get; set; } = string.Empty; // "Sale", "Payment", "Refund", "Adjustment"

        [Required]
        public decimal Amount { get; set; }

        public decimal BalanceBefore { get; set; }

        public decimal BalanceAfter { get; set; }

        [StringLength(100)]
        public string Reference { get; set; } = string.Empty; // Invoice number, payment reference, etc.

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [StringLength(100)]
        public string CreatedBy { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
    }
} 