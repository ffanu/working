using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Models
{
    public class Category
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [StringLength(50)]
        public string Code { get; set; } = string.Empty; // Short code like "ELEC", "COMP"

        [StringLength(100)]
        public string? ParentCategoryId { get; set; } // For hierarchical categories

        [StringLength(100)]
        public string? ParentCategoryName { get; set; }

        public int Level { get; set; } = 1; // Hierarchy level (1 = root, 2 = sub, etc.)

        public int SortOrder { get; set; } = 0; // For custom ordering

        [StringLength(100)]
        public string Color { get; set; } = "#3B82F6"; // Hex color for UI

        [StringLength(100)]
        public string Icon { get; set; } = "Package"; // Icon name for UI

        public bool IsActive { get; set; } = true;

        public bool IsDefault { get; set; } = false; // Default category for new products

        // Category-specific rules
        public bool RequiresSerialNumber { get; set; } = false;
        public bool RequiresBatchTracking { get; set; } = false;
        public bool RequiresExpiryDate { get; set; } = false;
        public int? DefaultShelfLifeDays { get; set; }
        public string? DefaultStorageConditions { get; set; }

        // Financial settings
        public decimal? DefaultProfitMargin { get; set; }
        public decimal? DefaultMarkupPercentage { get; set; }

        // Inventory settings
        public int? DefaultMinStockLevel { get; set; }
        public int? DefaultReorderPoint { get; set; }

        // Metadata
        public List<string> Tags { get; set; } = new List<string>();
        public Dictionary<string, object> CustomFields { get; set; } = new Dictionary<string, object>();

        // Audit fields
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string UpdatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Computed properties
        [BsonIgnore]
        public int ProductCount { get; set; } = 0;

        [BsonIgnore]
        public decimal TotalValue { get; set; } = 0;

        [BsonIgnore]
        public List<Category> SubCategories { get; set; } = new List<Category>();
    }
}


