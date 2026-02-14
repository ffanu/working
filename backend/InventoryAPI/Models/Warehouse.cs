using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Models
{
    public class Warehouse
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [StringLength(100)]
        public string ShopId { get; set; } = string.Empty;

        [StringLength(100)]
        public string ShopName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(200)]
        public string Description { get; set; } = string.Empty;

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

        [StringLength(100)]
        public string ContactPerson { get; set; } = string.Empty;

        [StringLength(20)]
        public string ContactPhone { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(100)]
        public string? ContactEmail { get; set; }

        [StringLength(50)]
        public string Type { get; set; } = "Warehouse"; // Warehouse, Store, Distribution Center

        [StringLength(50)]
        public string Status { get; set; } = "Active"; // Active, Inactive, Maintenance

        public bool IsDefault { get; set; } = false;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [StringLength(100)]
        public string CreatedBy { get; set; } = string.Empty;

        // Warehouse capacity and settings
        public decimal? TotalCapacity { get; set; } // in cubic meters or square feet
        public decimal? UsedCapacity { get; set; }
        public int? MaxProducts { get; set; }

        // Operating hours
        [StringLength(100)]
        public string OperatingHours { get; set; } = "24/7";

        // Special features
        public bool HasRefrigeration { get; set; } = false;
        public bool HasFreezer { get; set; } = false;
        public bool HasHazardousStorage { get; set; } = false;
        public bool HasSecuritySystem { get; set; } = false;

        // Computed properties
        [BsonIgnore]
        public decimal CapacityUtilization => TotalCapacity.HasValue && TotalCapacity.Value > 0 
            ? (UsedCapacity ?? 0) / TotalCapacity.Value * 100 
            : 0;

        [BsonIgnore]
        public bool IsNearCapacity => CapacityUtilization > 80;
    }
}


