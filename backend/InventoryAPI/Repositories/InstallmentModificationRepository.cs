using MongoDB.Driver;
using InventoryAPI.Models;
using InventoryAPI.Repositories.Interfaces;
using InventoryAPI.Services;

namespace InventoryAPI.Repositories
{
    public class InstallmentModificationRepository : IInstallmentModificationRepository
    {
        private readonly IMongoCollection<InstallmentPlanModification> _modifications;

        public InstallmentModificationRepository(DatabaseService databaseService)
        {
            _modifications = databaseService.Database.GetCollection<InstallmentPlanModification>("installmentPlanModifications");
        }

        public async Task<InstallmentPlanModification> CreateModificationAsync(InstallmentPlanModification modification)
        {
            try
            {
                modification.CreatedAt = DateTime.UtcNow;
                modification.UpdatedAt = DateTime.UtcNow;
                await _modifications.InsertOneAsync(modification);
                return modification;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error creating installment modification: {ex.Message}", ex);
            }
        }

        public async Task<InstallmentPlanModification?> GetModificationByIdAsync(string id)
        {
            try
            {
                return await _modifications.Find(m => m.Id == id).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving modification by ID: {ex.Message}", ex);
            }
        }

        public async Task<List<InstallmentPlanModification>> GetModificationsByPlanIdAsync(string planId)
        {
            try
            {
                return await _modifications
                    .Find(m => m.InstallmentPlanId == planId)
                    .SortByDescending(m => m.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving modifications by plan ID: {ex.Message}", ex);
            }
        }

        public async Task<List<InstallmentPlanModification>> GetPendingModificationsAsync()
        {
            try
            {
                return await _modifications
                    .Find(m => m.Status == "Pending")
                    .SortBy(m => m.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving pending modifications: {ex.Message}", ex);
            }
        }

        public async Task<InstallmentPlanModification> UpdateModificationAsync(InstallmentPlanModification modification)
        {
            try
            {
                modification.UpdatedAt = DateTime.UtcNow;
                await _modifications.ReplaceOneAsync(m => m.Id == modification.Id, modification);
                return modification;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error updating modification: {ex.Message}", ex);
            }
        }

        public async Task<bool> DeleteModificationAsync(string id)
        {
            try
            {
                var result = await _modifications.DeleteOneAsync(m => m.Id == id);
                return result.DeletedCount > 0;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error deleting modification: {ex.Message}", ex);
            }
        }

        public async Task<List<InstallmentPlanModification>> GetModificationsByCustomerAsync(string customerId)
        {
            try
            {
                return await _modifications
                    .Find(m => m.RequestedBy == customerId)
                    .SortByDescending(m => m.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving modifications by customer: {ex.Message}", ex);
            }
        }

        public async Task<List<InstallmentPlanModification>> GetModificationsAsync(int skip = 0, int limit = 50, string status = "")
        {
            try
            {
                var filter = string.IsNullOrEmpty(status) 
                    ? Builders<InstallmentPlanModification>.Filter.Empty
                    : Builders<InstallmentPlanModification>.Filter.Eq(m => m.Status, status);

                return await _modifications
                    .Find(filter)
                    .SortByDescending(m => m.CreatedAt)
                    .Skip(skip)
                    .Limit(limit)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving modifications: {ex.Message}", ex);
            }
        }
    }
}


