using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Models
{
    public class GoodsReceivedNote
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string PurchaseOrderId { get; set; } = string.Empty;

        [StringLength(100)]
        public string GRNNumber { get; set; } = string.Empty;

        [Required]
        public string SupplierId { get; set; } = string.Empty;

        [StringLength(100)]
        public string SupplierName { get; set; } = string.Empty;

        [Required]
        public string WarehouseId { get; set; } = string.Empty;

        [StringLength(100)]
        public string WarehouseName { get; set; } = string.Empty;

        [Required]
        public string ReceivedBy { get; set; } = string.Empty;

        public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;

        [StringLength(50)]
        public string Status { get; set; } = "pending"; // pending, received, verified, completed

        [StringLength(500)]
        public string Notes { get; set; } = string.Empty;

        public List<GRNItem> Items { get; set; } = new List<GRNItem>();

        public decimal TotalReceivedValue { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;
    }

    public class GRNItem
    {
        [Required]
        public string ProductId { get; set; } = string.Empty;

        [StringLength(100)]
        public string ProductName { get; set; } = string.Empty;

        [StringLength(100)]
        public string ProductSKU { get; set; } = string.Empty;

        public int OrderedQuantity { get; set; } = 0; // What was ordered

        public int ReceivedQuantity { get; set; } = 0; // What was actually received

        public int AcceptedQuantity { get; set; } = 0; // What was accepted (good quality)

        public int RejectedQuantity { get; set; } = 0; // What was rejected (damaged/defective)

        public decimal UnitCost { get; set; } = 0;

        public decimal TotalCost { get; set; } = 0;

        [StringLength(100)]
        public string? BatchNumber { get; set; } = string.Empty;

        public DateTime? ExpiryDate { get; set; }

        [StringLength(100)]
        public string? StorageLocation { get; set; } = string.Empty; // Bin/Rack location

        [StringLength(500)]
        public string? QualityNotes { get; set; } = string.Empty;

        [StringLength(50)]
        public string QualityStatus { get; set; } = "pending"; // pending, accepted, rejected, partial
    }
}


