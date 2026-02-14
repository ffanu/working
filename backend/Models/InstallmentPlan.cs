using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace InventoryApp.Models
{
    [BsonCollection("installmentPlans")]
    public class InstallmentPlan
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("saleId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string SaleId { get; set; } = string.Empty;

        [BsonElement("customerId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string CustomerId { get; set; } = string.Empty;

        [BsonElement("products")]
        public List<InstallmentPlanProduct> Products { get; set; } = new List<InstallmentPlanProduct>();

        [BsonElement("totalPrice")]
        public decimal TotalPrice { get; set; }

        [BsonElement("downPayment")]
        public decimal DownPayment { get; set; }

        [BsonElement("numberOfInstallments")]
        public int NumberOfInstallments { get; set; }

        [BsonElement("installmentAmount")]
        public decimal InstallmentAmount { get; set; }

        [BsonElement("interestRate")]
        public double InterestRate { get; set; }

        [BsonElement("startDate")]
        public DateTime StartDate { get; set; }

        [BsonElement("endDate")]
        public DateTime EndDate { get; set; }

        [BsonElement("status")]
        public string Status { get; set; } = "Active"; // Active, Completed, Defaulted, Cancelled

        [BsonElement("payments")]
        public List<InstallmentPayment> Payments { get; set; } = new List<InstallmentPayment>();

        [BsonElement("totalPaid")]
        public decimal TotalPaid { get; set; } = 0;

        [BsonElement("remainingBalance")]
        public decimal RemainingBalance { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Computed properties
        [BsonIgnore]
        public decimal TotalAmountWithInterest => TotalPrice - DownPayment + (TotalPrice - DownPayment) * (decimal)InterestRate / 100;

        [BsonIgnore]
        public int PaidInstallments => Payments.Count(p => p.Status == "Paid");

        [BsonIgnore]
        public int PendingInstallments => Payments.Count(p => p.Status == "Pending");

        [BsonIgnore]
        public int OverdueInstallments => Payments.Count(p => p.Status == "Overdue");

        [BsonIgnore]
        public bool IsCompleted => PaidInstallments == NumberOfInstallments;

        [BsonIgnore]
        public DateTime? NextDueDate => Payments.Where(p => p.Status == "Pending").OrderBy(p => p.DueDate).FirstOrDefault()?.DueDate;
    }
}
