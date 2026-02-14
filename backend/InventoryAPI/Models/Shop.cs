using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Models
{
    public class Shop
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(200)]
        public string Description { get; set; } = string.Empty;

        [StringLength(100)]
        public string Code { get; set; } = string.Empty; // Short code like "BAN", "DHN"

        [StringLength(200)]
        public string Address { get; set; } = string.Empty;

        [StringLength(100)]
        public string City { get; set; } = string.Empty;

        [StringLength(100)]
        public string State { get; set; } = string.Empty;

        [StringLength(20)]
        public string PostalCode { get; set; } = string.Empty;

        [StringLength(100)]
        public string Country { get; set; } = string.Empty;

        [StringLength(20)]
        public string Phone { get; set; } = string.Empty;

        [StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [StringLength(100)]
        public string ManagerName { get; set; } = string.Empty;

        [StringLength(20)]
        public string ManagerPhone { get; set; } = string.Empty;

        [StringLength(100)]
        public string ManagerEmail { get; set; } = string.Empty;

        // Shop settings
        public string TimeZone { get; set; } = "UTC";
        public string Currency { get; set; } = "USD";
        public string Language { get; set; } = "en";

        // Business hours
        public Dictionary<string, string> BusinessHours { get; set; } = new Dictionary<string, string>();

        // Shop status
        public bool IsActive { get; set; } = true;
        public bool IsMainBranch { get; set; } = false;

        // Financial settings
        public decimal? CreditLimit { get; set; }
        public decimal? TaxRate { get; set; } = 10.0m;

        // Inventory settings
        public bool AllowNegativeStock { get; set; } = false;
        public bool RequireWarehouseSelection { get; set; } = true;

        // Audit fields
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string UpdatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Computed properties
        [BsonIgnore]
        public int WarehouseCount { get; set; } = 0;

        [BsonIgnore]
        public List<Warehouse> Warehouses { get; set; } = new List<Warehouse>();
    }
}
