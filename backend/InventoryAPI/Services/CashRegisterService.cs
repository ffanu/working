using MongoDB.Driver;
using MongoDB.Bson;
using InventoryAPI.Models;

namespace InventoryAPI.Services
{
    public class CashRegisterService
    {
        private readonly IMongoCollection<CashRegister> _cashRegisters;
        private readonly IMongoCollection<CashTransaction> _transactions;
        private readonly IMongoCollection<Sale> _sales;
        private readonly IMongoCollection<Refund> _refunds;

        public CashRegisterService(DatabaseService databaseService)
        {
            _cashRegisters = databaseService.CashRegisters;
            _transactions = databaseService.CashTransactions;
            _sales = databaseService.Sales;
            _refunds = databaseService.Refunds;
        }

        // Cash Register Management
        public async Task<List<CashRegister>> GetAllAsync()
        {
            return await _cashRegisters.Find(_ => true)
                .SortByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<CashRegister?> GetByIdAsync(string id)
        {
            return await _cashRegisters.Find(r => r.Id == id).FirstOrDefaultAsync();
        }

        public async Task<CashRegister?> GetOpenRegisterAsync(string userId)
        {
            return await _cashRegisters.Find(r => 
                r.CurrentUserId == userId && r.Status == ShiftStatus.Open)
                .FirstOrDefaultAsync();
        }

        public async Task<CashRegister> OpenShiftAsync(string registerName, string location, string userId, string userName, decimal openingCash)
        {
            // Check if user already has an open shift
            var existingShift = await GetOpenRegisterAsync(userId);
            if (existingShift != null)
            {
                throw new InvalidOperationException("User already has an open shift");
            }

            var cashRegister = new CashRegister
            {
                RegisterName = registerName,
                Location = location,
                CurrentUserId = userId,
                CurrentUserName = userName,
                ShiftStartTime = DateTime.UtcNow,
                Status = ShiftStatus.Open,
                OpeningCash = openingCash,
                CurrentCash = openingCash,
                ExpectedCash = openingCash,
                CreatedBy = userName
            };

            await _cashRegisters.InsertOneAsync(cashRegister);
            return cashRegister;
        }

        public async Task<bool> CloseShiftAsync(string registerId, string userId, decimal closingCash, string notes)
        {
            var cashRegister = await GetByIdAsync(registerId);
            if (cashRegister == null || cashRegister.CurrentUserId != userId)
            {
                return false;
            }

            // Calculate expected cash
            var expectedCash = cashRegister.OpeningCash + cashRegister.NetCashFlow;

            var update = Builders<CashRegister>.Update
                .Set(r => r.Status, ShiftStatus.Closed)
                .Set(r => r.ShiftEndTime, DateTime.UtcNow)
                .Set(r => r.CurrentCash, closingCash)
                .Set(r => r.ExpectedCash, expectedCash)
                .Set(r => r.ClosingNotes, notes)
                .Set(r => r.UpdatedAt, DateTime.UtcNow);

            var result = await _cashRegisters.UpdateOneAsync(r => r.Id == registerId, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> SuspendShiftAsync(string registerId, string userId)
        {
            var cashRegister = await GetByIdAsync(registerId);
            if (cashRegister == null || cashRegister.CurrentUserId != userId)
            {
                return false;
            }

            var update = Builders<CashRegister>.Update
                .Set(r => r.Status, ShiftStatus.Suspended)
                .Set(r => r.UpdatedAt, DateTime.UtcNow);

            var result = await _cashRegisters.UpdateOneAsync(r => r.Id == registerId, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> ResumeShiftAsync(string registerId, string userId)
        {
            var cashRegister = await GetByIdAsync(registerId);
            if (cashRegister == null || cashRegister.CurrentUserId != userId)
            {
                return false;
            }

            var update = Builders<CashRegister>.Update
                .Set(r => r.Status, ShiftStatus.Open)
                .Set(r => r.UpdatedAt, DateTime.UtcNow);

            var result = await _cashRegisters.UpdateOneAsync(r => r.Id == registerId, update);
            return result.ModifiedCount > 0;
        }

        // Cash Transactions
        public async Task<CashTransaction> RecordTransactionAsync(CashTransaction transaction)
        {
            transaction.CreatedAt = DateTime.UtcNow;
            transaction.TransactionTime = DateTime.UtcNow;

            // Update cash register balance
            await UpdateRegisterBalance(transaction);

            await _transactions.InsertOneAsync(transaction);
            return transaction;
        }

        private async Task UpdateRegisterBalance(CashTransaction transaction)
        {
            var cashRegister = await GetByIdAsync(transaction.CashRegisterId);
            if (cashRegister == null) return;

            var update = Builders<CashRegister>.Update
                .Set(r => r.UpdatedAt, DateTime.UtcNow);

            switch (transaction.Type)
            {
                case TransactionType.CashIn:
                    update = update.Inc(r => r.TotalCashIn, transaction.Amount)
                                 .Inc(r => r.CurrentCash, transaction.Amount);
                    break;
                case TransactionType.CashOut:
                    update = update.Inc(r => r.TotalCashOut, transaction.Amount)
                                 .Inc(r => r.CurrentCash, -transaction.Amount);
                    break;
                case TransactionType.Sale:
                    update = update.Inc(r => r.TotalSales, transaction.Amount)
                                 .Inc(r => r.TotalTransactions, 1);
                    if (transaction.PaymentMethod == "Cash")
                    {
                        update = update.Inc(r => r.CashPayments, transaction.Amount)
                                     .Inc(r => r.CashTransactions, 1);
                    }
                    else if (transaction.PaymentMethod == "Card")
                    {
                        update = update.Inc(r => r.CardPayments, transaction.Amount)
                                     .Inc(r => r.CardTransactions, 1);
                    }
                    else if (transaction.PaymentMethod == "Credit")
                    {
                        update = update.Inc(r => r.CreditPayments, transaction.Amount)
                                     .Inc(r => r.CreditTransactions, 1);
                    }
                    break;
                case TransactionType.Refund:
                    update = update.Inc(r => r.TotalRefunds, transaction.Amount)
                                 .Inc(r => r.TotalTransactions, 1);
                    break;
            }

            await _cashRegisters.UpdateOneAsync(r => r.Id == transaction.CashRegisterId, update);
        }

        public async Task<List<CashTransaction>> GetTransactionsAsync(string registerId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var filter = Builders<CashTransaction>.Filter.Eq(t => t.CashRegisterId, registerId);

            if (startDate.HasValue)
            {
                filter = Builders<CashTransaction>.Filter.And(filter,
                    Builders<CashTransaction>.Filter.Gte(t => t.TransactionTime, startDate.Value));
            }

            if (endDate.HasValue)
            {
                filter = Builders<CashTransaction>.Filter.And(filter,
                    Builders<CashTransaction>.Filter.Lte(t => t.TransactionTime, endDate.Value));
            }

            return await _transactions.Find(filter)
                .SortByDescending(t => t.TransactionTime)
                .ToListAsync();
        }

        // Cash In/Out Operations
        public async Task<CashTransaction> CashInAsync(string registerId, decimal amount, string description, string userId, string userName, string notes = "")
        {
            var transaction = new CashTransaction
            {
                CashRegisterId = registerId,
                RegisterName = (await GetByIdAsync(registerId))?.RegisterName ?? "",
                Type = TransactionType.CashIn,
                Amount = amount,
                Description = description,
                Notes = notes,
                UserId = userId,
                UserName = userName,
                PaymentMethod = "Cash",
                Reference = $"CASH-IN-{DateTime.UtcNow:yyyyMMdd-HHmmss}"
            };

            return await RecordTransactionAsync(transaction);
        }

        public async Task<CashTransaction> CashOutAsync(string registerId, decimal amount, string description, string userId, string userName, string notes = "")
        {
            var cashRegister = await GetByIdAsync(registerId);
            if (cashRegister == null || cashRegister.CurrentCash < amount)
            {
                throw new InvalidOperationException("Insufficient cash in register");
            }

            var transaction = new CashTransaction
            {
                CashRegisterId = registerId,
                RegisterName = cashRegister.RegisterName,
                Type = TransactionType.CashOut,
                Amount = amount,
                Description = description,
                Notes = notes,
                UserId = userId,
                UserName = userName,
                PaymentMethod = "Cash",
                Reference = $"CASH-OUT-{DateTime.UtcNow:yyyyMMdd-HHmmss}"
            };

            return await RecordTransactionAsync(transaction);
        }

        // Reports and Summaries
        public async Task<ShiftSummary> GetShiftSummaryAsync(string registerId)
        {
            var cashRegister = await GetByIdAsync(registerId);
            if (cashRegister == null) return new ShiftSummary();

            var transactions = await GetTransactionsAsync(registerId, cashRegister.ShiftStartTime, cashRegister.ShiftEndTime);

            return new ShiftSummary
            {
                RegisterName = cashRegister.RegisterName,
                UserName = cashRegister.CurrentUserName,
                ShiftStart = cashRegister.ShiftStartTime,
                ShiftEnd = cashRegister.ShiftEndTime ?? DateTime.UtcNow,
                Duration = cashRegister.ShiftDuration,
                OpeningCash = cashRegister.OpeningCash,
                ClosingCash = cashRegister.CurrentCash,
                TotalSales = cashRegister.TotalSales,
                TotalRefunds = cashRegister.TotalRefunds,
                NetCashFlow = cashRegister.NetCashFlow,
                TotalTransactions = cashRegister.TotalTransactions,
                CashDifference = cashRegister.CashDifference,
                Status = cashRegister.Status.ToString()
            };
        }

        public async Task<object> GetDailySummaryAsync(DateTime date)
        {
            var startOfDay = date.Date;
            var endOfDay = startOfDay.AddDays(1);

            var pipeline = new[]
            {
                new BsonDocument("$match", new BsonDocument
                {
                    { "createdAt", new BsonDocument
                        {
                            { "$gte", startOfDay },
                            { "$lt", endOfDay }
                        }
                    }
                }),
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$Status" },
                    { "count", new BsonDocument("$sum", 1) },
                    { "totalSales", new BsonDocument("$sum", "$TotalSales") },
                    { "totalRefunds", new BsonDocument("$sum", "$TotalRefunds") }
                })
            };

            var dailyStats = await _cashRegisters.Aggregate<BsonDocument>(pipeline).ToListAsync();

            var totalRegisters = await _cashRegisters.CountDocumentsAsync(r => 
                r.CreatedAt >= startOfDay && r.CreatedAt < endOfDay);

            var totalSales = await _cashRegisters.Aggregate()
                .Match(r => r.CreatedAt >= startOfDay && r.CreatedAt < endOfDay)
                .Group(_ => true, g => new { TotalSales = g.Sum(r => r.TotalSales) })
                .FirstOrDefaultAsync();

            return new
            {
                date = startOfDay,
                totalRegisters,
                totalSales = totalSales?.TotalSales ?? 0,
                statusBreakdown = dailyStats
            };
        }
    }
}
