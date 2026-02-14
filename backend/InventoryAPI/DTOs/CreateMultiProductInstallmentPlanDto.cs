using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.DTOs
{
    public class InstallmentPlanProductDto
    {
        [Required]
        public string ProductId { get; set; } = string.Empty;
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }
        
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }
        
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class CreateMultiProductInstallmentPlanDto
    {
        [Required]
        public string CustomerId { get; set; } = string.Empty;
        
        [Required]
        [MinLength(1, ErrorMessage = "At least one product is required")]
        public List<InstallmentPlanProductDto> Products { get; set; } = new List<InstallmentPlanProductDto>();
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Total price must be greater than 0")]
        public decimal TotalPrice { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "Down payment cannot be negative")]
        public decimal DownPayment { get; set; }
        
        [Required]
        [Range(1, 60, ErrorMessage = "Number of months must be between 1 and 60")]
        public int NumberOfMonths { get; set; }
        
        [Range(0, 100, ErrorMessage = "Interest rate must be between 0 and 100")]
        public double InterestRate { get; set; } = 0; // Annual interest rate percentage
        
        public DateTime StartDate { get; set; } = DateTime.UtcNow;
    }
}
