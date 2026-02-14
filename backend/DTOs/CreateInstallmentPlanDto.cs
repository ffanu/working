using System.ComponentModel.DataAnnotations;

namespace InventoryApp.DTOs
{
    public class CreateInstallmentPlanDto
    {
        [Required]
        public string SaleId { get; set; } = string.Empty;

        [Required]
        public string CustomerId { get; set; } = string.Empty;

        [Required]
        public string ProductId { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Total price must be greater than 0")]
        public decimal TotalPrice { get; set; }

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Down payment cannot be negative")]
        public decimal DownPayment { get; set; }

        [Required]
        [Range(1, 120, ErrorMessage = "Number of months must be between 1 and 120")]
        public int NumberOfMonths { get; set; }

        [Required]
        [Range(0, 100, ErrorMessage = "Interest rate must be between 0 and 100")]
        public double InterestRate { get; set; }

        [Required]
        public DateTime StartDate { get; set; }
    }
}


