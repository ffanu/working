using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Models
{
    public class WarehouseOperation
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string OperationType { get; set; } = string.Empty; // pick, pack, ship, receive, transfer

        [Required]
        public string WarehouseId { get; set; } = string.Empty;

        [StringLength(100)]
        public string WarehouseName { get; set; } = string.Empty;

        [Required]
        public string ReferenceNumber { get; set; } = string.Empty; // PO, SO, Transfer Order

        [StringLength(100)]
        public string ReferenceType { get; set; } = string.Empty; // Purchase, Sale, Transfer

        [StringLength(50)]
        public string Status { get; set; } = "pending"; // pending, in-progress, completed, cancelled

        public DateTime ScheduledAt { get; set; } = DateTime.UtcNow;

        public DateTime? StartedAt { get; set; } = null;

        public DateTime? CompletedAt { get; set; } = null;

        [Required]
        public string AssignedTo { get; set; } = string.Empty; // Warehouse operator

        public List<WarehouseOperationItem> Items { get; set; } = new List<WarehouseOperationItem>();

        [StringLength(500)]
        public string Notes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;
    }

    public class WarehouseOperationItem
    {
        [Required]
        public string ProductId { get; set; } = string.Empty;

        [StringLength(100)]
        public string ProductName { get; set; } = string.Empty;

        [StringLength(100)]
        public string ProductSKU { get; set; } = string.Empty;

        public int RequiredQuantity { get; set; } = 0;

        public int PickedQuantity { get; set; } = 0;

        public int PackedQuantity { get; set; } = 0;

        public int ShippedQuantity { get; set; } = 0;

        [StringLength(100)]
        public string? BatchNumber { get; set; } = string.Empty;

        [StringLength(100)]
        public string? BinLocation { get; set; } = string.Empty;

        [StringLength(100)]
        public string? PickLocation { get; set; } = string.Empty;

        [StringLength(100)]
        public string? PackLocation { get; set; } = string.Empty;

        [StringLength(50)]
        public string Status { get; set; } = "pending"; // pending, picked, packed, shipped

        public DateTime? PickedAt { get; set; } = null;

        public string? PickedBy { get; set; } = string.Empty;

        public DateTime? PackedAt { get; set; } = null;

        public string? PackedBy { get; set; } = string.Empty;

        public DateTime? ShippedAt { get; set; } = null;

        public string? ShippedBy { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Notes { get; set; } = string.Empty;
    }
}


