using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Models
{
    public class StockReconciliation
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string WarehouseId { get; set; } = string.Empty;

        [StringLength(100)]
        public string WarehouseName { get; set; } = string.Empty;

        [Required]
        public string ReconciledBy { get; set; } = string.Empty;

        public DateTime ReconciledAt { get; set; } = DateTime.UtcNow;

        [StringLength(50)]
        public string Status { get; set; } = "pending"; // pending, in-progress, completed, approved

        [StringLength(500)]
        public string Notes { get; set; } = string.Empty;

        public List<StockReconciliationItem> Items { get; set; } = new List<StockReconciliationItem>();

        public decimal TotalVariance { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;
    }

    public class StockReconciliationItem
    {
        [Required]
        public string ProductId { get; set; } = string.Empty;

        [StringLength(100)]
        public string ProductName { get; set; } = string.Empty;

        [StringLength(100)]
        public string ProductSKU { get; set; } = string.Empty;

        public int SystemQuantity { get; set; } = 0; // What system thinks we have

        public int PhysicalQuantity { get; set; } = 0; // What we actually counted

        public int Variance { get; set; } = 0; // Physical - System

        public decimal UnitCost { get; set; } = 0;

        public decimal VarianceValue { get; set; } = 0; // Variance * UnitCost

        [StringLength(100)]
        public string? BatchNumber { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Location { get; set; } = string.Empty; // Bin/Rack location

        [StringLength(500)]
        public string? Notes { get; set; } = string.Empty;
    }
}


