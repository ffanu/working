using InventoryAPI.Models;
using InventoryAPI.Repositories.Interfaces;
using InventoryAPI.Services;
using MongoDB.Bson;
using MongoDB.Driver;

namespace InventoryAPI.Repositories
{
    public class InstallmentPlanRepository : IInstallmentPlanRepository
    {
        private readonly IMongoCollection<InstallmentPlan> _installmentPlans;

        public InstallmentPlanRepository(DatabaseService databaseService)
        {
            _installmentPlans = databaseService.Database.GetCollection<InstallmentPlan>("installmentPlans");
        }

        public async Task<InstallmentPlan> CreatePlanAsync(InstallmentPlan plan)
        {
            try
            {
                Console.WriteLine($"Repository: Creating installment plan for sale {plan.SaleId}");
                plan.CreatedAt = DateTime.UtcNow;
                plan.UpdatedAt = DateTime.UtcNow;
                
                Console.WriteLine($"Repository: About to insert plan into MongoDB");
                await _installmentPlans.InsertOneAsync(plan);
                Console.WriteLine($"Repository: Successfully inserted plan with ID {plan.Id}");
                return plan;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Repository Error: {ex.Message}");
                Console.WriteLine($"Repository Stack Trace: {ex.StackTrace}");
                throw new Exception($"Error creating installment plan: {ex.Message}", ex);
            }
        }

        public async Task<InstallmentPlan?> GetPlanByIdAsync(string id)
        {
            try
            {
                if (!ObjectId.TryParse(id, out _))
                {
                    return null;
                }

                var filter = Builders<InstallmentPlan>.Filter.Eq(p => p.Id, id);
                return await _installmentPlans.Find(filter).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving installment plan by ID: {ex.Message}", ex);
            }
        }

        public async Task<List<InstallmentPlan>> GetPlansByCustomerIdAsync(string customerId)
        {
            try
            {
                if (!ObjectId.TryParse(customerId, out _))
                {
                    return new List<InstallmentPlan>();
                }

                var filter = Builders<InstallmentPlan>.Filter.Eq(p => p.CustomerId, customerId);
                var sort = Builders<InstallmentPlan>.Sort.Descending(p => p.CreatedAt);
                
                return await _installmentPlans.Find(filter).Sort(sort).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving installment plans by customer ID: {ex.Message}", ex);
            }
        }

        public async Task<List<InstallmentPlan>> GetPlansBySaleIdAsync(string saleId)
        {
            try
            {
                if (!ObjectId.TryParse(saleId, out _))
                {
                    return new List<InstallmentPlan>();
                }

                var filter = Builders<InstallmentPlan>.Filter.Eq(p => p.SaleId, saleId);
                return await _installmentPlans.Find(filter).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving installment plans by sale ID: {ex.Message}", ex);
            }
        }

        public async Task<List<InstallmentPlan>> GetAllPlansAsync()
        {
            try
            {
                var sort = Builders<InstallmentPlan>.Sort.Descending(p => p.CreatedAt);
                return await _installmentPlans.Find(_ => true).Sort(sort).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving all installment plans: {ex.Message}", ex);
            }
        }

        public async Task<List<InstallmentPlan>> GetPlansByStatusAsync(string status)
        {
            try
            {
                var filter = Builders<InstallmentPlan>.Filter.Eq(p => p.Status, status);
                var sort = Builders<InstallmentPlan>.Sort.Descending(p => p.CreatedAt);
                
                return await _installmentPlans.Find(filter).Sort(sort).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving installment plans by status: {ex.Message}", ex);
            }
        }

        public async Task<List<InstallmentPlan>> GetOverduePlansAsync()
        {
            try
            {
                var currentDate = DateTime.UtcNow;
                var filter = Builders<InstallmentPlan>.Filter.And(
                    Builders<InstallmentPlan>.Filter.Eq(p => p.Status, "Active"),
                    Builders<InstallmentPlan>.Filter.ElemMatch(p => p.Payments, 
                        payment => payment.Status == "Pending" && payment.DueDate < currentDate)
                );

                return await _installmentPlans.Find(filter).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving overdue installment plans: {ex.Message}", ex);
            }
        }

        public async Task<bool> UpdatePlanAsync(InstallmentPlan plan)
        {
            try
            {
                if (!ObjectId.TryParse(plan.Id, out _))
                {
                    return false;
                }

                plan.UpdatedAt = DateTime.UtcNow;
                
                var filter = Builders<InstallmentPlan>.Filter.Eq(p => p.Id, plan.Id);
                var result = await _installmentPlans.ReplaceOneAsync(filter, plan);
                
                return result.ModifiedCount > 0;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error updating installment plan: {ex.Message}", ex);
            }
        }

        public async Task<bool> DeletePlanAsync(string id)
        {
            try
            {
                if (!ObjectId.TryParse(id, out _))
                {
                    return false;
                }

                var filter = Builders<InstallmentPlan>.Filter.Eq(p => p.Id, id);
                var result = await _installmentPlans.DeleteOneAsync(filter);
                
                return result.DeletedCount > 0;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error deleting installment plan: {ex.Message}", ex);
            }
        }

        public async Task<long> GetTotalPlansCountAsync()
        {
            try
            {
                return await _installmentPlans.CountDocumentsAsync(_ => true);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting total plans count: {ex.Message}", ex);
            }
        }

        public async Task<decimal> GetTotalOutstandingAmountAsync()
        {
            try
            {
                var activePlans = await GetPlansByStatusAsync("Active");
                return activePlans.Sum(p => p.RemainingBalance);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error calculating total outstanding amount: {ex.Message}", ex);
            }
        }

        public async Task<bool> ClearAllPlansAsync()
        {
            try
            {
                var result = await _installmentPlans.DeleteManyAsync(Builders<InstallmentPlan>.Filter.Empty);
                return result.IsAcknowledged;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error clearing all installment plans: {ex.Message}", ex);
            }
        }
    }
}
