using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace InventoryAPI.Models
{
    public enum RefundStatus
    {
        Pending,
        Approved,
        Rejected,
        Processed,
        Cancelled
    }

    public enum RefundType
    {
        FullRefund,
        PartialRefund,
        Exchange,
        StoreCredit
    }

    public enum RefundReason
    {
        Defective,
        WrongItem,
        SizeIssue,
        QualityIssue,
        CustomerRequest,
        DamagedInTransit,
        Expired,
        Other
    }

    public class Refund
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string OriginalSaleId { get; set; } = string.Empty;

        [Required]
        public string CustomerId { get; set; } = string.Empty;

        [Required]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        public DateTime RefundDate { get; set; } = DateTime.UtcNow;

        [Required]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public RefundStatus Status { get; set; } = RefundStatus.Pending;

        [Required]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public RefundType Type { get; set; } = RefundType.FullRefund;

        [Required]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public RefundReason Reason { get; set; } = RefundReason.Other;

        [StringLength(500)]
        public string Notes { get; set; } = string.Empty;

        [Required]
        public List<RefundItem> Items { get; set; } = new List<RefundItem>();

        [Required]
        [Range(0, double.MaxValue)]
        public decimal TotalRefundAmount { get; set; }

        [Range(0, double.MaxValue)]
        public decimal ProcessingFee { get; set; } = 0;

        [Range(0, double.MaxValue)]
        public decimal NetRefundAmount => TotalRefundAmount - ProcessingFee;

        [StringLength(100)]
        public string ProcessedBy { get; set; } = string.Empty;

        public DateTime? ProcessedAt { get; set; }

        [StringLength(100)]
        public string ApprovedBy { get; set; } = string.Empty;

        public DateTime? ApprovedAt { get; set; }

        [StringLength(500)]
        public string RejectionReason { get; set; } = string.Empty;

        // Payment method for refund
        [StringLength(50)]
        public string RefundMethod { get; set; } = "OriginalPaymentMethod"; // "Cash", "CreditCard", "StoreCredit", etc.

        // Store credit details (if applicable)
        public string? StoreCreditId { get; set; }

        [Range(0, double.MaxValue)]
        public decimal StoreCreditAmount { get; set; } = 0;

        // Return shipping information
        public bool ReturnShippingRequired { get; set; } = false;

        [StringLength(100)]
        public string ReturnShippingMethod { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal ReturnShippingCost { get; set; } = 0;

        // Audit fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [StringLength(100)]
        public string CreatedBy { get; set; } = string.Empty;

        [BsonIgnore]
        public bool IsProcessed => Status == RefundStatus.Processed;

        [BsonIgnore]
        public bool IsApproved => Status == RefundStatus.Approved;

        [BsonIgnore]
        public bool CanBeProcessed => Status == RefundStatus.Approved;
    }

    public class RefundItem
    {
        [Required]
        public string ProductId { get; set; } = string.Empty;

        [Required]
        public string ProductName { get; set; } = string.Empty;

        [Required]
        public string ProductSKU { get; set; } = string.Empty;

        [Required]
        public int Quantity { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal UnitPrice { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal TotalPrice { get; set; }

        [Range(0, double.MaxValue)]
        public decimal RefundAmount { get; set; }

        [StringLength(200)]
        public string ItemNotes { get; set; } = string.Empty;

        // Condition of returned item
        [StringLength(50)]
        public string ItemCondition { get; set; } = "Good"; // "Good", "Damaged", "Used", "Defective"

        // Whether item should be restocked
        public bool RestockItem { get; set; } = true;

        // Restock quantity (may be less than returned quantity if some items are damaged)
        public int RestockQuantity { get; set; } = 0;
    }
}


