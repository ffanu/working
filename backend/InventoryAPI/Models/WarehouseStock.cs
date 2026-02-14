using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Models
{
    public class WarehouseStock
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
        public string WarehouseId { get; set; } = string.Empty;

        [Required]
        public string WarehouseName { get; set; } = string.Empty;

        [Required]
        [Range(0, int.MaxValue)]
        public int AvailableQuantity { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int ReservedQuantity { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int TotalQuantity => AvailableQuantity + ReservedQuantity;

        [Required]
        [Range(0, double.MaxValue)]
        public decimal AverageCost { get; set; }

        [StringLength(100)]
        public string Location { get; set; } = string.Empty;

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [StringLength(100)]
        public string CreatedBy { get; set; } = string.Empty;

        // Computed properties
        [BsonIgnore]
        public bool IsLowStock => AvailableQuantity <= 5;

        [BsonIgnore]
        public bool IsOutOfStock => AvailableQuantity == 0;
    }
}


