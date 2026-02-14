using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace InventoryAPI.Models
{
    public class InstallmentPayment
    {
        [BsonElement("installmentNumber")]
        public int InstallmentNumber { get; set; }

        [BsonElement("dueDate")]
        public DateTime DueDate { get; set; }

        [BsonElement("amountDue")]
        public decimal AmountDue { get; set; }

        [BsonElement("principalAmount")]
        public decimal PrincipalAmount { get; set; }

        [BsonElement("interestAmount")]
        public decimal InterestAmount { get; set; }

        [BsonElement("amountPaid")]
        public decimal AmountPaid { get; set; }

        [BsonElement("paymentDate")]
        public DateTime? PaymentDate { get; set; }

        [BsonElement("status")]
        public string Status { get; set; } = "Pending"; // Pending, Paid, Overdue

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
