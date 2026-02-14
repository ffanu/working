using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Models
{
    public class Sale
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string CustomerId { get; set; } = string.Empty;

        [StringLength(100)]
        public string CustomerName { get; set; } = string.Empty;

        // Shop relationship fields (optional - either ShopId or WarehouseId required)
        public string ShopId { get; set; } = string.Empty;

        [StringLength(100)]
        public string ShopName { get; set; } = string.Empty;

        [StringLength(200)]
        public string ShopLocation { get; set; } = string.Empty;

        // Warehouse relationship fields (optional - either ShopId or WarehouseId required)
        public string WarehouseId { get; set; } = string.Empty;

        [StringLength(100)]
        public string WarehouseName { get; set; } = string.Empty;

        [StringLength(100)]
        public string WarehouseLocation { get; set; } = string.Empty;

        [Required]
        public List<SaleItem> Items { get; set; } = new List<SaleItem>();

        [Required]
        [Range(0, double.MaxValue)]
        public decimal TotalAmount { get; set; }

        public DateTime SaleDate { get; set; } = DateTime.UtcNow;

        [StringLength(50)]
        public string Status { get; set; } = "completed"; // completed, pending, cancelled

        [StringLength(50)]
        public string PaymentMethod { get; set; } = string.Empty;

        [StringLength(500)]
        public string Notes { get; set; } = string.Empty;

        [StringLength(50)]
        public string InvoiceNumber { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [StringLength(100)]
        public string CreatedBy { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
    }

    public class SaleItem
    {
        [Required]
        public string ProductId { get; set; } = string.Empty;

        [StringLength(100)]
        public string ProductName { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal UnitPrice { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal TotalPrice { get; set; }

        // Cost price for profit calculations
        [Range(0, double.MaxValue)]
        public decimal CostPrice { get; set; }

        // Shop-specific item tracking
        public string? ShopId { get; set; } = string.Empty;
        public string? ShopName { get; set; } = string.Empty;

        // Warehouse-specific item tracking
        public string? WarehouseId { get; set; } = string.Empty;
        public string? WarehouseName { get; set; } = string.Empty;
    }
} 