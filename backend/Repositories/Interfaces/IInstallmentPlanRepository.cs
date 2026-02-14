using InventoryApp.Models;

namespace InventoryApp.Repositories.Interfaces
{
    public interface IInstallmentPlanRepository
    {
        Task<InstallmentPlan> CreatePlanAsync(InstallmentPlan plan);
        Task<InstallmentPlan?> GetPlanByIdAsync(string id);
        Task<List<InstallmentPlan>> GetPlansByCustomerIdAsync(string customerId);
        Task<List<InstallmentPlan>> GetPlansBySaleIdAsync(string saleId);
        Task<List<InstallmentPlan>> GetAllPlansAsync();
        Task<List<InstallmentPlan>> GetPlansByStatusAsync(string status);
        Task<List<InstallmentPlan>> GetOverduePlansAsync();
        Task<bool> UpdatePlanAsync(InstallmentPlan plan);
        Task<bool> DeletePlanAsync(string id);
        Task<long> GetTotalPlansCountAsync();
        Task<decimal> GetTotalOutstandingAmountAsync();
    }
}


