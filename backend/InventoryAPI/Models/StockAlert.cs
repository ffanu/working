using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Models
{
    public class StockAlert
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string ProductId { get; set; } = string.Empty;

        [StringLength(100)]
        public string ProductName { get; set; } = string.Empty;

        [StringLength(100)]
        public string ProductSKU { get; set; } = string.Empty;

        [Required]
        public string WarehouseId { get; set; } = string.Empty;

        [StringLength(100)]
        public string WarehouseName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string AlertType { get; set; } = string.Empty; // low_stock, overstock, expiry, aging, quality

        [Required]
        [StringLength(50)]
        public string Severity { get; set; } = string.Empty; // low, medium, high, critical

        [StringLength(500)]
        public string Message { get; set; } = string.Empty;

        public int CurrentQuantity { get; set; } = 0;

        public int ThresholdQuantity { get; set; } = 0;

        public decimal? CurrentValue { get; set; } = 0;

        public DateTime? ExpiryDate { get; set; } = null;

        public int? DaysUntilExpiry { get; set; } = null;

        public int? AgingDays { get; set; } = null; // How long stock has been sitting

        [StringLength(50)]
        public string Status { get; set; } = "active"; // active, acknowledged, resolved, dismissed

        public DateTime? AcknowledgedAt { get; set; } = null;

        public string? AcknowledgedBy { get; set; } = string.Empty;

        public DateTime? ResolvedAt { get; set; } = null;

        public string? ResolvedBy { get; set; } = string.Empty;

        [StringLength(500)]
        public string? ResolutionNotes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;
    }
}


