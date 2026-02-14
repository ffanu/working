using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace InventoryApp.Models
{
    public class InstallmentPayment
    {
        [BsonElement("dueDate")]
        public DateTime DueDate { get; set; }

        [BsonElement("amountDue")]
        public decimal AmountDue { get; set; }

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


