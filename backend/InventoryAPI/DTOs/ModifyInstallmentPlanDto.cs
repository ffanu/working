using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.DTOs
{
    public class ModifyInstallmentPlanDto
    {
        [Required]
        public string InstallmentPlanId { get; set; } = string.Empty;

        [Required]
        public string ModificationType { get; set; } = string.Empty; // "ChangeInstallmentCount", "ChangeInterestRate", "AddProducts", "ChangeDownPayment"

        [Required]
        public string Reason { get; set; } = string.Empty;

        public string RequestedBy { get; set; } = string.Empty; // Customer ID

        // For ChangeInstallmentCount
        public int? NewInstallmentCount { get; set; }

        // For ChangeInterestRate
        public double? NewInterestRate { get; set; }

        // For AddProducts
        public List<AddProductDto> AdditionalProducts { get; set; } = new List<AddProductDto>();

        // For ChangeDownPayment
        public decimal? AdditionalDownPayment { get; set; }
    }

    public class AddProductDto
    {
        [Required]
        public string ProductId { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; } = 1;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }
    }

    public class ApproveModificationDto
    {
        [Required]
        public string ModificationId { get; set; } = string.Empty;

        [Required]
        public string ApprovedBy { get; set; } = string.Empty; // Admin ID

        public string ApprovalNotes { get; set; } = string.Empty;
    }

    public class RejectModificationDto
    {
        [Required]
        public string ModificationId { get; set; } = string.Empty;

        [Required]
        public string RejectedBy { get; set; } = string.Empty; // Admin ID

        [Required]
        public string RejectionReason { get; set; } = string.Empty;
    }

    public class ModificationPreviewDto
    {
        public string InstallmentPlanId { get; set; } = string.Empty;
        public string ModificationType { get; set; } = string.Empty;
        
        // Current Plan Details
        public decimal CurrentMonthlyEMI { get; set; }
        public decimal CurrentRemainingBalance { get; set; }
        public int CurrentRemainingInstallments { get; set; }
        public DateTime? CurrentEndDate { get; set; }
        public decimal CurrentTotalPayable { get; set; }

        // New Plan Details
        public decimal NewMonthlyEMI { get; set; }
        public decimal NewRemainingBalance { get; set; }
        public int NewRemainingInstallments { get; set; }
        public DateTime? NewEndDate { get; set; }
        public decimal NewTotalPayable { get; set; }

        // Impact Analysis
        public decimal EMIDifference { get; set; }
        public decimal TotalPayableDifference { get; set; }
        public int TimeDifferenceMonths { get; set; }
        public bool IsFinanciallyBeneficial { get; set; }
        public string RecommendationNote { get; set; } = string.Empty;

        // New Payment Schedule (from next installment onward)
        public List<InstallmentPaymentPreview> NewPaymentSchedule { get; set; } = new List<InstallmentPaymentPreview>();
    }

    public class InstallmentPaymentPreview
    {
        public int InstallmentNumber { get; set; }
        public DateTime DueDate { get; set; }
        public decimal PrincipalAmount { get; set; }
        public decimal InterestAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal RemainingBalance { get; set; }
    }
}


