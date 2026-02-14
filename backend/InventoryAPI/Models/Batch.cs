using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Models
{
    public class Batch
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string ProductId { get; set; } = string.Empty;

        [Required]
        public string ProductName { get; set; } = string.Empty;

        [Required]
        public string ProductSKU { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string BatchNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string LotNumber { get; set; } = string.Empty;

        [Required]
        public DateTime ManufactureDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int InitialQuantity { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int CurrentQuantity { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal UnitCost { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal TotalCost { get; set; }

        [StringLength(100)]
        public string Supplier { get; set; } = string.Empty;

        [StringLength(100)]
        public string SupplierInvoice { get; set; } = string.Empty;

        [StringLength(100)]
        public string Location { get; set; } = "Main Warehouse";

        [StringLength(50)]
        public string Status { get; set; } = "Active"; // Active, Expired, Recalled, Depleted

        [StringLength(500)]
        public string Notes { get; set; } = string.Empty;

        [StringLength(100)]
        public string CreatedBy { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property (not stored in MongoDB)
        [BsonIgnore]
        public Product? Product { get; set; }

        // Computed properties
        [BsonIgnore]
        public bool IsExpired => ExpiryDate.HasValue && ExpiryDate.Value < DateTime.UtcNow;

        [BsonIgnore]
        public bool IsLowStock => CurrentQuantity <= 5;

        [BsonIgnore]
        public int DaysUntilExpiry => ExpiryDate.HasValue ? (int)(ExpiryDate.Value - DateTime.UtcNow).TotalDays : -1;

        [BsonIgnore]
        public bool IsExpiringSoon => ExpiryDate.HasValue && DaysUntilExpiry <= 30 && DaysUntilExpiry > 0;
    }
}


