using MongoDB.Driver;
using InventoryAPI.Models;

namespace InventoryAPI.Services
{
    public class SaleService
    {
        private readonly IMongoCollection<Sale> _sales;
        private readonly ProductService _productService;
        private readonly CustomerLedgerService _customerLedgerService;
        private readonly WarehouseStockService _warehouseStockService;

        public SaleService(DatabaseService databaseService, ProductService productService, CustomerLedgerService customerLedgerService, WarehouseStockService warehouseStockService)
        {
            _sales = databaseService.Sales;
            _productService = productService;
            _customerLedgerService = customerLedgerService;
            _warehouseStockService = warehouseStockService;
        }

        public async Task<List<Sale>> GetAllAsync()
        {
            return await _sales.Find(s => s.IsActive).SortByDescending(s => s.CreatedAt).ToListAsync();
        }

        public async Task<(List<Sale> data, int total)> GetPagedAsync(string? search, string? sortBy, string? sortDir, int page, int pageSize)
        {
            var filter = Builders<Sale>.Filter.Eq(s => s.IsActive, true);

            // Apply search filter if provided
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchFilter = Builders<Sale>.Filter.Or(
                    Builders<Sale>.Filter.Regex(s => s.InvoiceNumber, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Sale>.Filter.Regex(s => s.CustomerName, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Sale>.Filter.Regex(s => s.ShopName, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Sale>.Filter.Regex(s => s.WarehouseName, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Sale>.Filter.Regex(s => s.Status, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Sale>.Filter.Regex(s => s.PaymentMethod, new MongoDB.Bson.BsonRegularExpression(search, "i"))
                );
                filter = Builders<Sale>.Filter.And(filter, searchFilter);
            }

            // Get total count
            var total = await _sales.CountDocumentsAsync(filter);

            // Apply sorting
            var sort = sortBy?.ToLower() switch
            {
                "invoicenumber" => sortDir?.ToLower() == "desc" 
                    ? Builders<Sale>.Sort.Descending(s => s.InvoiceNumber)
                    : Builders<Sale>.Sort.Ascending(s => s.InvoiceNumber),
                "customername" => sortDir?.ToLower() == "desc" 
                    ? Builders<Sale>.Sort.Descending(s => s.CustomerName)
                    : Builders<Sale>.Sort.Ascending(s => s.CustomerName),
                "totalamount" => sortDir?.ToLower() == "desc"
                    ? Builders<Sale>.Sort.Descending(s => s.TotalAmount)
                    : Builders<Sale>.Sort.Ascending(s => s.TotalAmount),
                "saledate" => sortDir?.ToLower() == "desc"
                    ? Builders<Sale>.Sort.Descending(s => s.SaleDate)
                    : Builders<Sale>.Sort.Ascending(s => s.SaleDate),
                "status" => sortDir?.ToLower() == "desc"
                    ? Builders<Sale>.Sort.Descending(s => s.Status)
                    : Builders<Sale>.Sort.Ascending(s => s.Status),
                _ => sortDir?.ToLower() == "desc"
                    ? Builders<Sale>.Sort.Descending(s => s.CreatedAt)
                    : Builders<Sale>.Sort.Ascending(s => s.CreatedAt)
            };

            // Apply pagination
            var data = await _sales.Find(filter)
                .Sort(sort)
                .Skip((page - 1) * pageSize)
                .Limit(pageSize)
                .ToListAsync();

            return (data, (int)total);
        }

        public async Task<Sale?> GetByIdAsync(string id)
        {
            return await _sales.Find(s => s.Id == id && s.IsActive).FirstOrDefaultAsync();
        }

        public async Task<Sale> CreateAsync(Sale sale)
        {
            // Validate that at least one of ShopId or WarehouseId is provided
            if (string.IsNullOrEmpty(sale.ShopId) && string.IsNullOrEmpty(sale.WarehouseId))
            {
                throw new ArgumentException("Either Shop ID or Warehouse ID is required for sale creation");
            }

            // Check if sale can be fulfilled from available stock
            var canFulfill = await _warehouseStockService.CanFulfillSaleAsync(sale.Items);
            if (!canFulfill)
            {
                throw new InvalidOperationException("Insufficient stock to fulfill this sale");
            }

            // Allocate stock for each item
            foreach (var item in sale.Items)
            {
                // Use item's warehouse ID, or fall back to sale's warehouse ID
                var preferredWarehouseId = !string.IsNullOrEmpty(item.WarehouseId) 
                    ? item.WarehouseId 
                    : sale.WarehouseId;
                    
                var allocation = await _warehouseStockService.AllocateStockAsync(
                    item.ProductId, 
                    item.Quantity, 
                    preferredWarehouseId);

                if (!allocation.Success)
                {
                    throw new InvalidOperationException($"Cannot allocate stock for product {item.ProductName}: {allocation.Message}");
                }

                // Update item with warehouse allocation details
                if (allocation.Allocations.Any())
                {
                    var primaryAllocation = allocation.Allocations.First();
                    item.WarehouseId = primaryAllocation.WarehouseId;
                    item.WarehouseName = primaryAllocation.WarehouseName;
                }
            }

            sale.CreatedAt = DateTime.UtcNow;
            sale.UpdatedAt = DateTime.UtcNow;
            sale.SaleDate = DateTime.UtcNow;

            // Auto-generate invoice number
            sale.InvoiceNumber = await GenerateInvoiceNumberAsync();

            // Calculate total amount
            sale.TotalAmount = sale.Items.Sum(item => item.TotalPrice);

            await _sales.InsertOneAsync(sale);

            // Update warehouse stock for each item
            foreach (var item in sale.Items)
            {
                // Reserve stock in warehouse
                await _warehouseStockService.ReserveStockAsync(item.ProductId, item.WarehouseId!, item.Quantity);
                
                // Confirm the reservation (convert to actual sale)
                await _warehouseStockService.ConfirmStockReservationAsync(item.ProductId, item.WarehouseId!, item.Quantity);
                
                // Also update global product stock
                await _productService.UpdateStockAsync(item.ProductId, -item.Quantity);
            }

            // Create customer ledger entry for this sale
            try
            {
                await _customerLedgerService.AddSaleTransactionAsync(sale);
            }
            catch (Exception ex)
            {
                // Log the error but don't fail the sale creation
                // In production, you might want to use a proper logging service
                Console.WriteLine($"Warning: Failed to create customer ledger entry: {ex.Message}");
            }

            return sale;
        }

        public async Task<bool> UpdateAsync(string id, Sale sale)
        {
            sale.Id = id;
            sale.UpdatedAt = DateTime.UtcNow;
            sale.TotalAmount = sale.Items.Sum(item => item.TotalPrice);

            var result = await _sales.ReplaceOneAsync(s => s.Id == id, sale);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var update = Builders<Sale>.Update.Set(s => s.IsActive, false);
            var result = await _sales.UpdateOneAsync(s => s.Id == id, update);
            return result.ModifiedCount > 0;
        }

        // NEW: Enhanced warehouse-sale relationship methods
        public async Task<List<WarehouseStock>> GetAvailableStockForProductAsync(string productId)
        {
            return await _warehouseStockService.GetAvailableStockAsync(productId, 1);
        }

        public async Task<StockAllocationResult> CheckStockAvailabilityAsync(string productId, int quantity, string? preferredWarehouseId = null)
        {
            return await _warehouseStockService.AllocateStockAsync(productId, quantity, preferredWarehouseId);
        }

        public async Task<bool> ValidateSaleAsync(Sale sale)
        {
            // Validate that at least one of ShopId or WarehouseId is provided
            if (string.IsNullOrEmpty(sale.ShopId) && string.IsNullOrEmpty(sale.WarehouseId))
                return false;

            return await _warehouseStockService.CanFulfillSaleAsync(sale.Items);
        }

        public async Task<List<Sale>> GetByCustomerAsync(string customerId)
        {
            return await _sales.Find(s => s.CustomerId == customerId && s.IsActive)
                .SortByDescending(s => s.CreatedAt).ToListAsync();
        }

        public async Task<List<Sale>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var filter = Builders<Sale>.Filter.And(
                Builders<Sale>.Filter.Gte(s => s.SaleDate, startDate),
                Builders<Sale>.Filter.Lte(s => s.SaleDate, endDate),
                Builders<Sale>.Filter.Eq(s => s.IsActive, true)
            );
            return await _sales.Find(filter).SortByDescending(s => s.CreatedAt).ToListAsync();
        }

        public async Task<List<Sale>> GetByStatusAsync(string status)
        {
            return await _sales.Find(s => s.Status == status && s.IsActive)
                .SortByDescending(s => s.CreatedAt).ToListAsync();
        }

        public async Task<string> GenerateInvoiceNumberAsync()
        {
            // Get the current year and month
            var currentYear = DateTime.UtcNow.Year;
            var currentMonth = DateTime.UtcNow.Month;
            
            // Find the highest invoice number for the current year/month
            var filter = Builders<Sale>.Filter.And(
                Builders<Sale>.Filter.Eq(s => s.IsActive, true),
                Builders<Sale>.Filter.Regex(s => s.InvoiceNumber, new MongoDB.Bson.BsonRegularExpression($"^INV-{currentYear}{currentMonth:D2}-", "i"))
            );
            
            var sort = Builders<Sale>.Sort.Descending(s => s.InvoiceNumber);
            var lastSale = await _sales.Find(filter).Sort(sort).FirstOrDefaultAsync();
            
            int nextNumber = 1;
            if (lastSale != null && !string.IsNullOrEmpty(lastSale.InvoiceNumber))
            {
                // Extract the number from the last invoice number (e.g., INV-202412-001 -> 1)
                var parts = lastSale.InvoiceNumber.Split('-');
                if (parts.Length >= 3 && int.TryParse(parts[2], out int lastNumber))
                {
                    nextNumber = lastNumber + 1;
                }
            }
            
            // Format: INV-YYYYMM-XXX (e.g., INV-202412-001)
            return $"INV-{currentYear}{currentMonth:D2}-{nextNumber:D3}";
        }
    }
} 