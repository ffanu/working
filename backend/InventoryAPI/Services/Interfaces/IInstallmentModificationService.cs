using InventoryAPI.Models;
using InventoryAPI.DTOs;

namespace InventoryAPI.Services.Interfaces
{
    public interface IInstallmentModificationService
    {
        Task<ModificationPreviewDto> PreviewModificationAsync(ModifyInstallmentPlanDto request);
        Task<InstallmentPlanModification> RequestModificationAsync(ModifyInstallmentPlanDto request);
        Task<InstallmentPlanModification> ApproveModificationAsync(ApproveModificationDto request);
        Task<InstallmentPlanModification> RejectModificationAsync(RejectModificationDto request);
        Task<InstallmentPlan> ApplyModificationAsync(string modificationId);
        Task<List<InstallmentPlanModification>> GetModificationsByPlanIdAsync(string planId);
        Task<List<InstallmentPlanModification>> GetPendingModificationsAsync();
        Task<InstallmentPlanModification?> GetModificationByIdAsync(string id);
        Task<List<InstallmentPlanModification>> GetModificationsByCustomerAsync(string customerId);
    }
}


