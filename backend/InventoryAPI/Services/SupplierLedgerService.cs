using MongoDB.Driver;
using MongoDB.Bson;
using InventoryAPI.Models;

namespace InventoryAPI.Services
{
    public class SupplierLedgerService
    {
        private readonly IMongoCollection<SupplierLedger> _supplierLedger;
        private readonly SupplierService _supplierService;

        public SupplierLedgerService(DatabaseService databaseService, SupplierService supplierService)
        {
            _supplierLedger = databaseService.SupplierLedger;
            _supplierService = supplierService;
        }

        public async Task<List<SupplierLedger>> GetAllAsync()
        {
            return await _supplierLedger.Find(_ => true).SortByDescending(s => s.CreatedAt).ToListAsync();
        }

        public async Task<SupplierLedger?> GetByIdAsync(string id)
        {
            return await _supplierLedger.Find(s => s.Id == id).FirstOrDefaultAsync();
        }

        public async Task<List<SupplierLedger>> GetBySupplierIdAsync(string supplierId)
        {
            return await _supplierLedger.Find(s => s.SupplierId == supplierId)
                .SortByDescending(s => s.CreatedAt).ToListAsync();
        }

        public async Task<List<SupplierLedger>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var filter = Builders<SupplierLedger>.Filter.And(
                Builders<SupplierLedger>.Filter.Gte(s => s.CreatedAt, startDate),
                Builders<SupplierLedger>.Filter.Lte(s => s.CreatedAt, endDate)
            );
            return await _supplierLedger.Find(filter).SortByDescending(s => s.CreatedAt).ToListAsync();
        }

        public async Task<SupplierLedger> CreateAsync(SupplierLedger ledger)
        {
            // Get current supplier balance
            var currentBalance = await GetCurrentBalanceAsync(ledger.SupplierId);
            
            ledger.BalanceBefore = currentBalance;
            ledger.BalanceAfter = currentBalance + ledger.Amount;
            ledger.CreatedAt = DateTime.UtcNow;

            await _supplierLedger.InsertOneAsync(ledger);
            return ledger;
        }

        public async Task<List<SupplierLedger>> GetByTypeAsync(string transactionType)
        {
            return await _supplierLedger.Find(s => s.TransactionType == transactionType)
                .SortByDescending(s => s.CreatedAt).ToListAsync();
        }

        public async Task<decimal> GetCurrentBalanceAsync(string supplierId)
        {
            var lastEntry = await _supplierLedger.Find(s => s.SupplierId == supplierId)
                .SortByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();

            return lastEntry?.BalanceAfter ?? 0;
        }

        public async Task<object> GetSupplierSummaryAsync()
        {
            var pipeline = new[]
            {
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$SupplierId" },
                    { "SupplierName", new BsonDocument("$first", "$SupplierName") },
                    { "TotalDebit", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray { new BsonDocument("$gt", new BsonArray { "$Amount", 0 }), "$Amount", 0 })) },
                    { "TotalCredit", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray { new BsonDocument("$lt", new BsonArray { "$Amount", 0 }), new BsonDocument("$abs", "$Amount"), 0 })) },
                    { "LastTransaction", new BsonDocument("$max", "$CreatedAt") }
                }),
                new BsonDocument("$project", new BsonDocument
                {
                    { "SupplierId", "$_id" },
                    { "SupplierName", 1 },
                    { "TotalDebit", 1 },
                    { "TotalCredit", 1 },
                    { "CurrentBalance", new BsonDocument("$subtract", new BsonArray { "$TotalDebit", "$TotalCredit" }) },
                    { "LastTransaction", 1 }
                })
            };

            var results = await _supplierLedger.Aggregate<BsonDocument>(pipeline).ToListAsync();
            return results;
        }

        public async Task<List<object>> GetDetailedLedgerBySupplierAsync(string supplierId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var filter = Builders<SupplierLedger>.Filter.Eq(s => s.SupplierId, supplierId);

            if (startDate.HasValue && endDate.HasValue)
            {
                filter = Builders<SupplierLedger>.Filter.And(
                    filter,
                    Builders<SupplierLedger>.Filter.Gte(s => s.CreatedAt, startDate.Value),
                    Builders<SupplierLedger>.Filter.Lte(s => s.CreatedAt, endDate.Value)
                );
            }

            var ledger = await _supplierLedger.Find(filter)
                .SortBy(s => s.CreatedAt)
                .ToListAsync();

            var result = new List<object>();
            decimal runningBalance = 0;

            foreach (var entry in ledger)
            {
                runningBalance += entry.Amount;
                result.Add(new
                {
                    entry.Id,
                    entry.SupplierId,
                    entry.SupplierName,
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

        public async Task<object> GetSupplierLedgerSummaryAsync(string supplierId)
        {
            var supplier = await _supplierService.GetByIdAsync(supplierId);
            if (supplier == null)
                return null;

            var currentBalance = await GetCurrentBalanceAsync(supplierId);
            var totalTransactions = await _supplierLedger.CountDocumentsAsync(s => s.SupplierId == supplierId);
            var lastTransaction = await _supplierLedger.Find(s => s.SupplierId == supplierId)
                .SortByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();

            return new
            {
                SupplierId = supplierId,
                SupplierName = supplier.Name,
                CurrentBalance = currentBalance,
                TotalTransactions = totalTransactions,
                LastTransactionDate = lastTransaction?.CreatedAt,
                LastTransactionType = lastTransaction?.TransactionType,
                LastTransactionAmount = lastTransaction?.Amount
            };
        }

        // Method to add a purchase transaction to the ledger
        public async Task AddPurchaseTransactionAsync(Purchase purchase)
        {
            var ledgerEntry = new SupplierLedger
            {
                SupplierId = purchase.SupplierId,
                SupplierName = purchase.SupplierName,
                TransactionId = purchase.Id!,
                TransactionType = "Purchase",
                Amount = purchase.TotalAmount, // Positive amount (we owe supplier)
                Reference = $"Purchase #{purchase.Id}",
                Description = $"Purchase of {purchase.Items.Count} items",
                TransactionDate = purchase.PurchaseDate,
                CreatedBy = purchase.CreatedBy
            };

            await CreateAsync(ledgerEntry);
        }

        // Method to add a payment transaction to the ledger
        public async Task AddPaymentTransactionAsync(string supplierId, decimal amount, string reference, string description, string createdBy)
        {
            var supplier = await _supplierService.GetByIdAsync(supplierId);
            if (supplier == null)
                throw new ArgumentException("Supplier not found");

            var ledgerEntry = new SupplierLedger
            {
                SupplierId = supplierId,
                SupplierName = supplier.Name,
                TransactionId = Guid.NewGuid().ToString(),
                TransactionType = "Payment",
                Amount = -amount, // Negative amount (we pay supplier)
                Reference = reference,
                Description = description,
                TransactionDate = DateTime.UtcNow,
                CreatedBy = createdBy
            };

            await CreateAsync(ledgerEntry);
        }

        // Method to get purchases collection for syncing
        public IMongoCollection<Purchase> GetPurchasesCollection(DatabaseService databaseService)
        {
            return databaseService.Purchases;
        }

        // Method to sync existing purchases with supplier ledger entries
        public async Task SyncExistingPurchasesAsync(IMongoCollection<Purchase> purchasesCollection)
        {
            try
            {
                var existingPurchases = await purchasesCollection.Find(p => p.IsActive).ToListAsync();
                var createdEntries = 0;

                foreach (var purchase in existingPurchases)
                {
                    // Check if ledger entry already exists for this purchase
                    var existingEntry = await _supplierLedger.Find(l => l.TransactionId == purchase.Id).FirstOrDefaultAsync();
                    
                    if (existingEntry == null)
                    {
                        // Create ledger entry for this purchase
                        var ledgerEntry = new SupplierLedger
                        {
                            SupplierId = purchase.SupplierId,
                            SupplierName = purchase.SupplierName,
                            TransactionId = purchase.Id!,
                            TransactionType = "Purchase",
                            Amount = purchase.TotalAmount, // Positive amount (we owe supplier)
                            Reference = $"Purchase #{purchase.Id}",
                            Description = $"Purchase of {purchase.Items.Count} items",
                            TransactionDate = purchase.PurchaseDate,
                            CreatedBy = purchase.CreatedBy
                        };

                        await CreateAsync(ledgerEntry);
                        createdEntries++;
                    }
                }

                Console.WriteLine($"Synced {createdEntries} purchases to supplier ledger");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error syncing purchases to supplier ledger: {ex.Message}");
                throw;
            }
        }
    }
} 