using MongoDB.Driver;
using MongoDB.Bson;
using InventoryAPI.Models;

namespace InventoryAPI.Services
{
    public class CustomerLedgerService
    {
        private readonly IMongoCollection<CustomerLedger> _customerLedger;
        private readonly CustomerService _customerService;

        public CustomerLedgerService(DatabaseService databaseService, CustomerService customerService)
        {
            _customerLedger = databaseService.CustomerLedger;
            _customerService = customerService;
        }

        // Method to get sales collection for syncing
        public IMongoCollection<Sale> GetSalesCollection(DatabaseService databaseService)
        {
            return databaseService.Sales;
        }

        public async Task<List<CustomerLedger>> GetAllAsync()
        {
            return await _customerLedger.Find(_ => true).SortByDescending(c => c.CreatedAt).ToListAsync();
        }

        public async Task<CustomerLedger?> GetByIdAsync(string id)
        {
            return await _customerLedger.Find(c => c.Id == id).FirstOrDefaultAsync();
        }

        public async Task<List<CustomerLedger>> GetByCustomerIdAsync(string customerId)
        {
            return await _customerLedger.Find(c => c.CustomerId == customerId)
                .SortByDescending(c => c.CreatedAt).ToListAsync();
        }

        public async Task<List<CustomerLedger>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var filter = Builders<CustomerLedger>.Filter.And(
                Builders<CustomerLedger>.Filter.Gte(c => c.CreatedAt, startDate),
                Builders<CustomerLedger>.Filter.Lte(c => c.CreatedAt, endDate)
            );
            return await _customerLedger.Find(filter).SortByDescending(c => c.CreatedAt).ToListAsync();
        }

        public async Task<CustomerLedger> CreateAsync(CustomerLedger ledger)
        {
            // Get current customer balance
            var currentBalance = await GetCurrentBalanceAsync(ledger.CustomerId);
            
            ledger.BalanceBefore = currentBalance;
            ledger.BalanceAfter = currentBalance + ledger.Amount;
            ledger.CreatedAt = DateTime.UtcNow;

            await _customerLedger.InsertOneAsync(ledger);
            return ledger;
        }

        public async Task<List<CustomerLedger>> GetByTypeAsync(string transactionType)
        {
            return await _customerLedger.Find(c => c.TransactionType == transactionType)
                .SortByDescending(c => c.CreatedAt).ToListAsync();
        }

        public async Task<decimal> GetCurrentBalanceAsync(string customerId)
        {
            var lastEntry = await _customerLedger.Find(c => c.CustomerId == customerId)
                .SortByDescending(c => c.CreatedAt)
                .FirstOrDefaultAsync();

            return lastEntry?.BalanceAfter ?? 0;
        }

        public async Task<object> GetCustomerSummaryAsync()
        {
            var pipeline = new[]
            {
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$CustomerId" },
                    { "CustomerName", new BsonDocument("$first", "$CustomerName") },
                    { "TotalDebit", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray { new BsonDocument("$gt", new BsonArray { "$Amount", 0 }), "$Amount", 0 })) },
                    { "TotalCredit", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray { new BsonDocument("$lt", new BsonArray { "$Amount", 0 }), new BsonDocument("$abs", "$Amount"), 0 })) },
                    { "LastTransaction", new BsonDocument("$max", "$CreatedAt") }
                }),
                new BsonDocument("$project", new BsonDocument
                {
                    { "CustomerId", "$_id" },
                    { "CustomerName", 1 },
                    { "TotalDebit", 1 },
                    { "TotalCredit", 1 },
                    { "CurrentBalance", new BsonDocument("$subtract", new BsonArray { "$TotalDebit", "$TotalCredit" }) },
                    { "LastTransaction", 1 }
                })
            };

            var results = await _customerLedger.Aggregate<BsonDocument>(pipeline).ToListAsync();
            return results;
        }

        public async Task<List<object>> GetDetailedLedgerByCustomerAsync(string customerId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var filter = Builders<CustomerLedger>.Filter.Eq(c => c.CustomerId, customerId);

            if (startDate.HasValue && endDate.HasValue)
            {
                filter = Builders<CustomerLedger>.Filter.And(
                    filter,
                    Builders<CustomerLedger>.Filter.Gte(c => c.CreatedAt, startDate.Value),
                    Builders<CustomerLedger>.Filter.Lte(c => c.CreatedAt, endDate.Value)
                );
            }

            var ledger = await _customerLedger.Find(filter)
                .SortBy(c => c.CreatedAt)
                .ToListAsync();

            var result = new List<object>();
            decimal runningBalance = 0;

            foreach (var entry in ledger)
            {
                runningBalance += entry.Amount;
                result.Add(new
                {
                    entry.Id,
                    entry.CustomerId,
                    entry.CustomerName,
                    entry.TransactionId,
                    entry.TransactionType,
                    entry.Amount,
                    entry.BalanceBefore,
                    BalanceAfter = runningBalance,
                    entry.Reference,
                    entry.Description,
                    entry.TransactionDate,
                    entry.CreatedAt,
                    entry.CreatedBy
                });
            }

            return result;
        }

        public async Task<object> GetCustomerLedgerSummaryAsync(string customerId)
        {
            var customer = await _customerService.GetByIdAsync(customerId);
            if (customer == null)
                return null;

            var currentBalance = await GetCurrentBalanceAsync(customerId);
            var totalTransactions = await _customerLedger.CountDocumentsAsync(c => c.CustomerId == customerId);
            var lastTransaction = await _customerLedger.Find(c => c.CustomerId == customerId)
                .SortByDescending(c => c.CreatedAt)
                .FirstOrDefaultAsync();

            return new
            {
                CustomerId = customerId,
                CustomerName = customer.Name,
                CurrentBalance = currentBalance,
                TotalTransactions = totalTransactions,
                LastTransactionDate = lastTransaction?.CreatedAt,
                LastTransactionType = lastTransaction?.TransactionType,
                LastTransactionAmount = lastTransaction?.Amount
            };
        }

        // Method to add a sale transaction to the ledger
        public async Task AddSaleTransactionAsync(Sale sale)
        {
            var ledgerEntry = new CustomerLedger
            {
                CustomerId = sale.CustomerId,
                CustomerName = sale.CustomerName,
                TransactionId = sale.Id!,
                TransactionType = "Sale",
                Amount = sale.TotalAmount, // Positive amount (customer owes us)
                Reference = $"Sale #{sale.Id}",
                Description = $"Sale of {sale.Items.Count} items",
                TransactionDate = sale.SaleDate,
                CreatedBy = sale.CreatedBy
            };

            await CreateAsync(ledgerEntry);
        }

        // Method to add a payment transaction to the ledger
        public async Task AddPaymentTransactionAsync(string customerId, decimal amount, string reference, string description, string createdBy)
        {
            var customer = await _customerService.GetByIdAsync(customerId);
            if (customer == null)
                throw new ArgumentException("Customer not found");

            var ledgerEntry = new CustomerLedger
            {
                CustomerId = customerId,
                CustomerName = customer.Name,
                TransactionId = Guid.NewGuid().ToString(),
                TransactionType = "Payment",
                Amount = -amount, // Negative amount (customer pays us)
                Reference = reference,
                Description = description,
                TransactionDate = DateTime.UtcNow,
                CreatedBy = createdBy
            };

            await CreateAsync(ledgerEntry);
        }

        // Method to sync existing sales with customer ledger (for testing/migration)
        public async Task SyncExistingSalesAsync()
        {
            // This method would need access to the sales collection
            // For now, we'll just return a success message
            // In a real implementation, you'd query all sales and create ledger entries
            await Task.CompletedTask;
        }

        // Method to sync existing sales with customer ledger entries
        public async Task SyncExistingSalesAsync(IMongoCollection<Sale> salesCollection)
        {
            try
            {
                var existingSales = await salesCollection.Find(s => s.IsActive).ToListAsync();
                var createdEntries = 0;

                foreach (var sale in existingSales)
                {
                    // Check if ledger entry already exists for this sale
                    var existingEntry = await _customerLedger.Find(l => l.TransactionId == sale.Id).FirstOrDefaultAsync();
                    
                    if (existingEntry == null)
                    {
                        // Create ledger entry for this sale
                        var ledgerEntry = new CustomerLedger
                        {
                            CustomerId = sale.CustomerId,
                            CustomerName = sale.CustomerName,
                            TransactionId = sale.Id!,
                            TransactionType = "Sale",
                            Amount = sale.TotalAmount, // Positive amount (customer owes us)
                            Reference = $"Sale #{sale.Id}",
                            Description = $"Sale of {sale.Items.Count} items",
                            TransactionDate = sale.SaleDate,
                            CreatedBy = sale.CreatedBy ?? "System"
                        };

                        await CreateAsync(ledgerEntry);
                        createdEntries++;
                    }
                }

                Console.WriteLine($"Synced {createdEntries} sales to customer ledger");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error syncing sales to customer ledger: {ex.Message}");
                throw;
            }
        }
    }
} 