using InventoryApp.Models;
using InventoryApp.DTOs;

namespace InventoryApp.Services.Interfaces
{
    public interface IInstallmentPlanService
    {
        Task<InstallmentPlan> CreatePlanAsync(string saleId, string customerId, string productId, 
            decimal totalPrice, decimal downPayment, int months, double interestRate, DateTime startDate);
        
        Task<InstallmentPlan?> GetPlanByIdAsync(string id);
        
        Task<List<InstallmentPlan>> GetPlansByCustomerIdAsync(string customerId);
        
        Task<List<InstallmentPlan>> GetAllPlansAsync();
        
        Task<InstallmentPlan> RecordPaymentAsync(string planId, int installmentIndex, decimal amount, DateTime? paymentDate = null);
        
        Task<bool> UpdatePlanStatusAsync(string planId, string status);
        
        Task<List<InstallmentPlan>> GetOverduePlansAsync();
        
        Task UpdateOverdueStatusAsync();
        
        Task<decimal> CalculateInstallmentAmountAsync(decimal principalAmount, double interestRate, int numberOfMonths);
        
        Task<List<InstallmentPayment>> GeneratePaymentScheduleAsync(decimal principalAmount, double interestRate, 
            int numberOfMonths, DateTime startDate);
            
        Task<bool> ValidatePaymentAsync(string planId, int installmentIndex, decimal amount);
        
        Task<InstallmentPlan> CompleteInstallmentPlanAsync(string planId);
    }
}


