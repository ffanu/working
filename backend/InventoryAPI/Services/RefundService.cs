using MongoDB.Driver;
using MongoDB.Bson;
using InventoryAPI.Models;

namespace InventoryAPI.Services
{
    public class RefundService
    {
        private readonly IMongoCollection<Refund> _refunds;
        private readonly IMongoCollection<Sale> _sales;
        private readonly IMongoCollection<Product> _products;

        public RefundService(DatabaseService databaseService)
        {
            _refunds = databaseService.Refunds;
            _sales = databaseService.Sales;
            _products = databaseService.Products;
        }

        public async Task<List<Refund>> GetAllAsync()
        {
            return await _refunds.Find(_ => true)
                .SortByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<Refund?> GetByIdAsync(string id)
        {
            return await _refunds.Find(r => r.Id == id).FirstOrDefaultAsync();
        }

        public async Task<List<Refund>> GetByCustomerAsync(string customerId)
        {
            return await _refunds.Find(r => r.CustomerId == customerId)
                .SortByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Refund>> GetByStatusAsync(RefundStatus status)
        {
            return await _refunds.Find(r => r.Status == status)
                .SortByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<Refund> CreateAsync(Refund refund)
        {
            refund.CreatedAt = DateTime.UtcNow;
            refund.UpdatedAt = DateTime.UtcNow;
            refund.Status = RefundStatus.Pending;

            // Calculate total refund amount
            refund.TotalRefundAmount = refund.Items.Sum(item => item.RefundAmount);
            
            // Set restock quantities
            foreach (var item in refund.Items)
            {
                item.RestockQuantity = item.RestockItem ? item.Quantity : 0;
            }

            await _refunds.InsertOneAsync(refund);
            return refund;
        }

        public async Task<bool> UpdateAsync(string id, Refund refund)
        {
            refund.Id = id;
            refund.UpdatedAt = DateTime.UtcNow;
            
            var result = await _refunds.ReplaceOneAsync(r => r.Id == id, refund);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> ApproveAsync(string id, string approvedBy)
        {
            var update = Builders<Refund>.Update
                .Set(r => r.Status, RefundStatus.Approved)
                .Set(r => r.ApprovedBy, approvedBy)
                .Set(r => r.ApprovedAt, DateTime.UtcNow)
                .Set(r => r.UpdatedAt, DateTime.UtcNow);

            var result = await _refunds.UpdateOneAsync(r => r.Id == id, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> RejectAsync(string id, string rejectedBy, string reason)
        {
            var update = Builders<Refund>.Update
                .Set(r => r.Status, RefundStatus.Rejected)
                .Set(r => r.RejectionReason, reason)
                .Set(r => r.UpdatedAt, DateTime.UtcNow);

            var result = await _refunds.UpdateOneAsync(r => r.Id == id, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> ProcessAsync(string id, string processedBy)
        {
            var refund = await GetByIdAsync(id);
            if (refund == null || !refund.CanBeProcessed)
                return false;

            try
            {
                // Process refund items and restock inventory
                await ProcessRefundItems(refund);

                // Update refund status
                var update = Builders<Refund>.Update
                    .Set(r => r.Status, RefundStatus.Processed)
                    .Set(r => r.ProcessedBy, processedBy)
                    .Set(r => r.ProcessedAt, DateTime.UtcNow)
                    .Set(r => r.UpdatedAt, DateTime.UtcNow);

                var result = await _refunds.UpdateOneAsync(r => r.Id == id, update);
                return result.ModifiedCount > 0;
            }
            catch (Exception)
            {
                return false;
            }
        }

        private async Task ProcessRefundItems(Refund refund)
        {
            foreach (var item in refund.Items)
            {
                if (item.RestockItem && item.RestockQuantity > 0)
                {
                    // Update product quantity directly (no stock movement tracking)

                    // Update product quantity
                    var productUpdate = Builders<Product>.Update
                        .Inc(p => p.Quantity, item.RestockQuantity);

                    await _products.UpdateOneAsync(p => p.Id == item.ProductId, productUpdate);
                }
            }
        }

        public async Task<bool> CancelAsync(string id)
        {
            var update = Builders<Refund>.Update
                .Set(r => r.Status, RefundStatus.Cancelled)
                .Set(r => r.UpdatedAt, DateTime.UtcNow);

            var result = await _refunds.UpdateOneAsync(r => r.Id == id, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _refunds.DeleteOneAsync(r => r.Id == id);
            return result.DeletedCount > 0;
        }

        public async Task<object> GetPagedAsync(
            string? search = null,
            RefundStatus? status = null,
            string? customerId = null,
            DateTime? startDate = null,
            DateTime? endDate = null,
            string? sortBy = null,
            string? sortDir = "desc",
            int page = 1,
            int pageSize = 20)
        {
            var filter = Builders<Refund>.Filter.Empty;

            if (status.HasValue)
            {
                filter = Builders<Refund>.Filter.And(filter, 
                    Builders<Refund>.Filter.Eq(r => r.Status, status.Value));
            }

            if (!string.IsNullOrEmpty(customerId))
            {
                filter = Builders<Refund>.Filter.And(filter, 
                    Builders<Refund>.Filter.Eq(r => r.CustomerId, customerId));
            }

            if (startDate.HasValue)
            {
                filter = Builders<Refund>.Filter.And(filter, 
                    Builders<Refund>.Filter.Gte(r => r.RefundDate, startDate.Value));
            }

            if (endDate.HasValue)
            {
                filter = Builders<Refund>.Filter.And(filter, 
                    Builders<Refund>.Filter.Lte(r => r.RefundDate, endDate.Value));
            }

            if (!string.IsNullOrEmpty(search))
            {
                var searchFilter = Builders<Refund>.Filter.Or(
                    Builders<Refund>.Filter.Regex(r => r.CustomerName, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Refund>.Filter.Regex(r => r.OriginalSaleId, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Refund>.Filter.Regex(r => r.Notes, new MongoDB.Bson.BsonRegularExpression(search, "i"))
                );
                filter = Builders<Refund>.Filter.And(filter, searchFilter);
            }

            var sort = Builders<Refund>.Sort.Descending(r => r.CreatedAt);
            if (!string.IsNullOrEmpty(sortBy))
            {
                sort = sortDir.ToLower() == "asc" 
                    ? Builders<Refund>.Sort.Ascending(sortBy)
                    : Builders<Refund>.Sort.Descending(sortBy);
            }

            var total = await _refunds.CountDocumentsAsync(filter);
            var refunds = await _refunds.Find(filter)
                .Sort(sort)
                .Skip((page - 1) * pageSize)
                .Limit(pageSize)
                .ToListAsync();

            return new { data = refunds, total };
        }

        public async Task<object> GetRefundStatsAsync()
        {
            var pipeline = new[]
            {
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$Status" },
                    { "count", new BsonDocument("$sum", 1) },
                    { "totalAmount", new BsonDocument("$sum", "$TotalRefundAmount") }
                }),
                new BsonDocument("$sort", new BsonDocument("_id", 1))
            };

            var stats = await _refunds.Aggregate<BsonDocument>(pipeline).ToListAsync();

            var totalRefunds = await _refunds.CountDocumentsAsync(_ => true);
            var totalAmount = await _refunds.Aggregate()
                .Group(_ => true, g => new { TotalAmount = g.Sum(r => r.TotalRefundAmount) })
                .FirstOrDefaultAsync();

            return new
            {
                totalRefunds,
                totalAmount = totalAmount?.TotalAmount ?? 0,
                statusBreakdown = stats
            };
        }
    }
}
