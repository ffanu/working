using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Models
{
    public class Product
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }

        [StringLength(50)]
        public string Category { get; set; } = string.Empty;

        [StringLength(50)]
        public string SKU { get; set; } = string.Empty;

        [StringLength(100)]
        public string Supplier { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Range(0, double.MaxValue)]
        public decimal CostPrice { get; set; }

        [StringLength(20)]
        public string Unit { get; set; } = "pcs";

        public bool IsActive { get; set; } = true;

        // Inventory management fields
        [Range(0, int.MaxValue)]
        public int MinStockLevel { get; set; } = 10;

        [Range(0, int.MaxValue)]
        public int ReorderPoint { get; set; } = 25;

        public DateTime? LastRestocked { get; set; }

        // NEW: Barcode and tracking fields
        [StringLength(100)]
        public string Barcode { get; set; } = string.Empty;

        [StringLength(100)]
        public string QRCode { get; set; } = string.Empty;

        // NEW: Enhanced inventory fields
        [StringLength(100)]
        public string Location { get; set; } = "Main Warehouse";

        [StringLength(100)]
        public string Brand { get; set; } = string.Empty;

        [StringLength(100)]
        public string Model { get; set; } = string.Empty;

        public decimal Weight { get; set; }

        [StringLength(50)]
        public string Dimensions { get; set; } = string.Empty;

        public bool RequiresSerialNumber { get; set; } = false;

        public bool RequiresBatchTracking { get; set; } = false;

        public int? ShelfLifeDays { get; set; }

        [StringLength(50)]
        public string StorageConditions { get; set; } = string.Empty; // "Room Temp", "Refrigerated", "Frozen"

        // NEW: Pricing fields
        public decimal? WholesalePrice { get; set; }
        public decimal? RetailPrice { get; set; }
        public decimal? DiscountPrice { get; set; }
        public DateTime? DiscountValidUntil { get; set; }

        // NEW: Supplier information
        [StringLength(100)]
        public string SupplierSKU { get; set; } = string.Empty;

        public int? LeadTimeDays { get; set; }

        public decimal? MinimumOrderQuantity { get; set; }

        // NEW: Tags for better categorization
        public List<string> Tags { get; set; } = new List<string>();

        // NEW: Images
        public List<string> ImageUrls { get; set; } = new List<string>();
        public string? MainImageUrl { get; set; }
    }
} 