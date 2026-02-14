using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace InventoryAPI.Models
{
    [BsonCollection("installmentPlanModifications")]
    public class InstallmentPlanModification
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("installmentPlanId")]
        public string InstallmentPlanId { get; set; } = string.Empty;

        [BsonElement("modificationType")]
        public string ModificationType { get; set; } = string.Empty; // "ChangeInstallmentCount", "ChangeInterestRate", "AddProducts", "ChangeDownPayment"

        [BsonElement("modificationDate")]
        public DateTime ModificationDate { get; set; } = DateTime.UtcNow;

        [BsonElement("requestedBy")]
        public string RequestedBy { get; set; } = string.Empty; // Customer ID or Admin ID

        [BsonElement("reason")]
        public string Reason { get; set; } = string.Empty;

        [BsonElement("status")]
        public string Status { get; set; } = "Pending"; // "Pending", "Approved", "Rejected", "Applied"

        // Previous Plan Details (for audit trail)
        [BsonElement("previousPlan")]
        public InstallmentPlanSnapshot PreviousPlan { get; set; } = new InstallmentPlanSnapshot();

        // New Plan Details
        [BsonElement("newPlan")]
        public InstallmentPlanSnapshot NewPlan { get; set; } = new InstallmentPlanSnapshot();

        // Modification Specific Details
        [BsonElement("modificationDetails")]
        public ModificationDetails ModificationDetails { get; set; } = new ModificationDetails();

        [BsonElement("appliedDate")]
        public DateTime? AppliedDate { get; set; }

        [BsonElement("approvedBy")]
        public string ApprovedBy { get; set; } = string.Empty;

        [BsonElement("rejectionReason")]
        public string RejectionReason { get; set; } = string.Empty;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class InstallmentPlanSnapshot
    {
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

        [BsonElement("remainingBalance")]
        public decimal RemainingBalance { get; set; }

        [BsonElement("paidInstallments")]
        public int PaidInstallments { get; set; }

        [BsonElement("totalPaid")]
        public decimal TotalPaid { get; set; }

        [BsonElement("products")]
        public List<InstallmentPlanProduct> Products { get; set; } = new List<InstallmentPlanProduct>();

        [BsonElement("nextDueDate")]
        public DateTime? NextDueDate { get; set; }
    }

    public class ModificationDetails
    {
        // For ChangeInstallmentCount
        [BsonElement("newInstallmentCount")]
        public int? NewInstallmentCount { get; set; }

        // For ChangeInterestRate
        [BsonElement("newInterestRate")]
        public double? NewInterestRate { get; set; }

        // For AddProducts
        [BsonElement("additionalProducts")]
        public List<InstallmentPlanProduct> AdditionalProducts { get; set; } = new List<InstallmentPlanProduct>();

        // For ChangeDownPayment (if allowed)
        [BsonElement("additionalDownPayment")]
        public decimal? AdditionalDownPayment { get; set; }

        // Calculated financial impact
        [BsonElement("financialImpact")]
        public FinancialImpact FinancialImpact { get; set; } = new FinancialImpact();
    }

    public class FinancialImpact
    {
        [BsonElement("oldMonthlyEMI")]
        public decimal OldMonthlyEMI { get; set; }

        [BsonElement("newMonthlyEMI")]
        public decimal NewMonthlyEMI { get; set; }

        [BsonElement("emiDifference")]
        public decimal EMIDifference { get; set; }

        [BsonElement("oldTotalPayable")]
        public decimal OldTotalPayable { get; set; }

        [BsonElement("newTotalPayable")]
        public decimal NewTotalPayable { get; set; }

        [BsonElement("totalPayableDifference")]
        public decimal TotalPayableDifference { get; set; }

        [BsonElement("oldEndDate")]
        public DateTime? OldEndDate { get; set; }

        [BsonElement("newEndDate")]
        public DateTime? NewEndDate { get; set; }

        [BsonElement("timeDifference")]
        public int TimeDifferenceMonths { get; set; }
    }
}


