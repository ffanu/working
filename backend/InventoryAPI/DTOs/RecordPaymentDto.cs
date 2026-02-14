using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.DTOs
{
    public class RecordPaymentDto
    {
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Payment amount must be greater than 0")]
        public decimal Amount { get; set; }

        public DateTime? PaymentDate { get; set; } = DateTime.UtcNow;

        public string? Notes { get; set; }
    }
}
