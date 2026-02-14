using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Models
{
    public class PaymentRequest
    {
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(100)]
        public string Reference { get; set; } = string.Empty;

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [StringLength(100)]
        public string? CreatedBy { get; set; }
    }
} 