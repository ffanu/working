using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace InventoryAPI.Models
{
    public enum ShiftStatus
    {
        Open,
        Closed,
        Suspended
    }

    public enum TransactionType
    {
        CashIn,
        CashOut,
        Sale,
        Refund,
        Adjustment,
        Transfer
    }

    public class CashRegister
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        [StringLength(100)]
        public string RegisterName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Location { get; set; } = string.Empty;

        [Required]
        public string CurrentUserId { get; set; } = string.Empty;

        [Required]
        public string CurrentUserName { get; set; } = string.Empty;

        [Required]
        public DateTime ShiftStartTime { get; set; } = DateTime.UtcNow;

        public DateTime? ShiftEndTime { get; set; }

        [Required]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ShiftStatus Status { get; set; } = ShiftStatus.Open;

        [Required]
        [Range(0, double.MaxValue)]
        public decimal OpeningCash { get; set; } = 0;

        [Range(0, double.MaxValue)]
        public decimal CurrentCash { get; set; } = 0;

        [Range(0, double.MaxValue)]
        public decimal ExpectedCash { get; set; } = 0;

        [Range(0, double.MaxValue)]
        public decimal CashDifference => CurrentCash - ExpectedCash;

        // Transaction summaries
        [Range(0, double.MaxValue)]
        public decimal TotalSales { get; set; } = 0;

        [Range(0, double.MaxValue)]
        public decimal TotalRefunds { get; set; } = 0;

        [Range(0, double.MaxValue)]
        public decimal TotalCashIn { get; set; } = 0;

        [Range(0, double.MaxValue)]
        public decimal TotalCashOut { get; set; } = 0;

        [Range(0, double.MaxValue)]
        public decimal NetCashFlow => TotalCashIn - TotalCashOut;

        // Payment method breakdowns
        [Range(0, double.MaxValue)]
        public decimal CashPayments { get; set; } = 0;

        [Range(0, double.MaxValue)]
        public decimal CardPayments { get; set; } = 0;

        [Range(0, double.MaxValue)]
        public decimal CreditPayments { get; set; } = 0;

        [Range(0, double.MaxValue)]
        public decimal OtherPayments { get; set; } = 0;

        // Transaction counts
        public int TotalTransactions { get; set; } = 0;

        public int CashTransactions { get; set; } = 0;

        public int CardTransactions { get; set; } = 0;

        public int CreditTransactions { get; set; } = 0;

        // Shift notes
        [StringLength(500)]
        public string ShiftNotes { get; set; } = string.Empty;

        [StringLength(500)]
        public string ClosingNotes { get; set; } = string.Empty;

        // Audit fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [StringLength(100)]
        public string CreatedBy { get; set; } = string.Empty;

        [BsonIgnore]
        public bool IsOpen => Status == ShiftStatus.Open;

        [BsonIgnore]
        public bool IsClosed => Status == ShiftStatus.Closed;

        [BsonIgnore]
        public TimeSpan ShiftDuration => 
            (ShiftEndTime ?? DateTime.UtcNow) - ShiftStartTime;
    }

    public class CashTransaction
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string CashRegisterId { get; set; } = string.Empty;

        [Required]
        public string RegisterName { get; set; } = string.Empty;

        [Required]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public TransactionType Type { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(200)]
        public string Description { get; set; } = string.Empty;

        [StringLength(500)]
        public string Notes { get; set; } = string.Empty;

        // Reference to related entities
        public string? SaleId { get; set; }

        public string? RefundId { get; set; }

        public string? CustomerId { get; set; }

        public string? CustomerName { get; set; }

        // User who made the transaction
        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public string UserName { get; set; } = string.Empty;

        // Cash balance before and after
        public decimal CashBefore { get; set; }

        public decimal CashAfter { get; set; }

        // Payment method details
        [StringLength(50)]
        public string PaymentMethod { get; set; } = string.Empty;

        [StringLength(100)]
        public string Reference { get; set; } = string.Empty;

        // Timestamps
        public DateTime TransactionTime { get; set; } = DateTime.UtcNow;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [StringLength(100)]
        public string CreatedBy { get; set; } = string.Empty;

        [BsonIgnore]
        public bool IsCashIn => Type == TransactionType.CashIn;

        [BsonIgnore]
        public bool IsCashOut => Type == TransactionType.CashOut;

        [BsonIgnore]
        public bool IsSale => Type == TransactionType.Sale;

        [BsonIgnore]
        public bool IsRefund => Type == TransactionType.Refund;
    }

    public class ShiftSummary
    {
        public string RegisterName { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public DateTime ShiftStart { get; set; }
        public DateTime ShiftEnd { get; set; }
        public TimeSpan Duration { get; set; }
        public decimal OpeningCash { get; set; }
        public decimal ClosingCash { get; set; }
        public decimal TotalSales { get; set; }
        public decimal TotalRefunds { get; set; }
        public decimal NetCashFlow { get; set; }
        public int TotalTransactions { get; set; }
        public decimal CashDifference { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}


