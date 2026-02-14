using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Models
{
    public class TransferOrder
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string TransferNumber { get; set; } = string.Empty;

        [Required]
        public string FromLocationId { get; set; } = string.Empty;

        [Required]
        public string FromLocationName { get; set; } = string.Empty;

        [Required]
        public string FromLocationType { get; set; } = string.Empty; // "warehouse" or "shop"

        [Required]
        public string ToLocationId { get; set; } = string.Empty;

        [Required]
        public string ToLocationName { get; set; } = string.Empty;

        [Required]
        public string ToLocationType { get; set; } = string.Empty; // "warehouse" or "shop"

        public List<TransferOrderItem> Items { get; set; } = new List<TransferOrderItem>();

        [Required]
        public string Status { get; set; } = "Pending"; // Pending, InProgress, Completed, Cancelled

        [Required]
        public DateTime RequestDate { get; set; } = DateTime.UtcNow;

        public DateTime? CompletedDate { get; set; }

        [Required]
        public string RequestedBy { get; set; } = string.Empty;

        public string? ApprovedBy { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Computed properties
        [BsonIgnore]
        public int TotalItems => Items.Sum(i => i.Quantity);

        [BsonIgnore]
        public decimal TotalValue => Items.Sum(i => i.Quantity * i.UnitCost);

        [BsonIgnore]
        public bool IsCompleted => Status == "Completed";

        [BsonIgnore]
        public bool IsPending => Status == "Pending";

        [BsonIgnore]
        public bool IsInProgress => Status == "InProgress";

        [BsonIgnore]
        public bool IsCancelled => Status == "Cancelled";
    }

    public class TransferOrderItem
    {
        [Required]
        public string ProductId { get; set; } = string.Empty;

        [Required]
        public string ProductName { get; set; } = string.Empty;

        [Required]
        public string ProductSKU { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal UnitCost { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal TotalCost => Quantity * UnitCost;

        public string? Notes { get; set; }

        // Transfer tracking
        public int TransferredQuantity { get; set; } = 0;

        [BsonIgnore]
        public int RemainingQuantity => Quantity - TransferredQuantity;

        [BsonIgnore]
        public bool IsFullyTransferred => TransferredQuantity >= Quantity;
    }
}
