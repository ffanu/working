using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Models
{
    public class Purchase
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string SupplierId { get; set; } = string.Empty;

        [StringLength(100)]
        public string SupplierName { get; set; } = string.Empty;

        // Warehouse relationship fields
        [Required]
        public string WarehouseId { get; set; } = string.Empty;

        [StringLength(100)]
        public string WarehouseName { get; set; } = string.Empty;

        [StringLength(100)]
        public string WarehouseLocation { get; set; } = string.Empty;

        [Required]
        public List<PurchaseItem> Items { get; set; } = new List<PurchaseItem>();

        [Required]
        [Range(0, double.MaxValue)]
        public decimal TotalAmount { get; set; }

        public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;

        [StringLength(50)]
        public string Status { get; set; } = "pending"; // pending, received, cancelled

        [StringLength(50)]
        public string PaymentMethod { get; set; } = string.Empty;

        [StringLength(100)]
        public string ChallanNumber { get; set; } = string.Empty;

        [StringLength(100)]
        public string InvoiceNumber { get; set; } = string.Empty;

        [StringLength(100)]
        public string DeliveryNote { get; set; } = string.Empty;

        public DateTime? ExpectedDeliveryDate { get; set; }

        public DateTime? ActualDeliveryDate { get; set; }

        [StringLength(100)]
        public string DeliveryAddress { get; set; } = string.Empty;

        [StringLength(100)]
        public string ContactPerson { get; set; } = string.Empty;

        [StringLength(20)]
        public string ContactPhone { get; set; } = string.Empty;

        [StringLength(100)]
        public string PurchaseOrderNumber { get; set; } = string.Empty;

        [StringLength(50)]
        public string PaymentTerms { get; set; } = string.Empty; // Net 30, Net 60, etc.

        public decimal? DiscountAmount { get; set; }

        public decimal? TaxAmount { get; set; }

        public decimal? ShippingCost { get; set; }

        [StringLength(500)]
        public string Notes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [StringLength(100)]
        public string CreatedBy { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        // Supplier performance tracking fields
        public int? DeliveryTime { get; set; } // Days to deliver

        [Range(1.0, 5.0)]
        public double? QualityRating { get; set; } // 1.0 to 5.0 rating

        public bool? OnTimeDelivery { get; set; } // Whether delivery was on time
    }

    public class PurchaseItem
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
        public decimal UnitCost { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal TotalCost { get; set; }

        // Warehouse-specific item tracking
        public string? BatchNumber { get; set; } = string.Empty;
        
        public DateTime? ExpiryDate { get; set; }
        
        [StringLength(100)]
        public string? StorageLocation { get; set; } = string.Empty; // Specific location within warehouse
    }
} 