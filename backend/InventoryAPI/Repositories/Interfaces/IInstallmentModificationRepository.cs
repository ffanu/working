using InventoryAPI.Models;

namespace InventoryAPI.Repositories.Interfaces
{
    public interface IInstallmentModificationRepository
    {
        Task<InstallmentPlanModification> CreateModificationAsync(InstallmentPlanModification modification);
        Task<InstallmentPlanModification?> GetModificationByIdAsync(string id);
        Task<List<InstallmentPlanModification>> GetModificationsByPlanIdAsync(string planId);
        Task<List<InstallmentPlanModification>> GetPendingModificationsAsync();
        Task<InstallmentPlanModification> UpdateModificationAsync(InstallmentPlanModification modification);
        Task<bool> DeleteModificationAsync(string id);
        Task<List<InstallmentPlanModification>> GetModificationsByCustomerAsync(string customerId);
        Task<List<InstallmentPlanModification>> GetModificationsAsync(int skip = 0, int limit = 50, string status = "");
    }
}


