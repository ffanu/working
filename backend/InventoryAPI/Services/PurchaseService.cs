using MongoDB.Driver;
using InventoryAPI.Models;

namespace InventoryAPI.Services
{
    public class PurchaseService
    {
        private readonly IMongoCollection<Purchase> _purchases;
        private readonly ProductService _productService;
        private readonly SupplierLedgerService _supplierLedgerService;
        private readonly WarehouseStockService _warehouseStockService;

        public PurchaseService(DatabaseService databaseService, ProductService productService, SupplierLedgerService supplierLedgerService, WarehouseStockService warehouseStockService)
        {
            _purchases = databaseService.Purchases;
            _productService = productService;
            _supplierLedgerService = supplierLedgerService;
            _warehouseStockService = warehouseStockService;
        }

        public async Task<List<Purchase>> GetAllAsync()
        {
            return await _purchases.Find(p => p.IsActive).SortByDescending(p => p.CreatedAt).ToListAsync();
        }

        public async Task<(List<Purchase> data, int total)> GetPagedAsync(string? search, string? sortBy, string? sortDir, int page, int pageSize)
        {
            var filter = Builders<Purchase>.Filter.Eq(p => p.IsActive, true);

            // Apply search filter if provided
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchFilter = Builders<Purchase>.Filter.Or(
                    Builders<Purchase>.Filter.Regex(p => p.SupplierName, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Purchase>.Filter.Regex(p => p.Status, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Purchase>.Filter.Regex(p => p.PaymentMethod, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Purchase>.Filter.Regex(p => p.ChallanNumber, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Purchase>.Filter.Regex(p => p.InvoiceNumber, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Purchase>.Filter.Regex(p => p.PurchaseOrderNumber, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Purchase>.Filter.Regex(p => p.ContactPerson, new MongoDB.Bson.BsonRegularExpression(search, "i"))
                );
                filter = Builders<Purchase>.Filter.And(filter, searchFilter);
            }

            // Get total count
            var total = await _purchases.CountDocumentsAsync(filter);

            // Apply sorting
            var sort = sortBy?.ToLower() switch
            {
                "suppliername" => sortDir?.ToLower() == "desc" 
                    ? Builders<Purchase>.Sort.Descending(p => p.SupplierName)
                    : Builders<Purchase>.Sort.Ascending(p => p.SupplierName),
                "totalamount" => sortDir?.ToLower() == "desc"
                    ? Builders<Purchase>.Sort.Descending(p => p.TotalAmount)
                    : Builders<Purchase>.Sort.Ascending(p => p.TotalAmount),
                "purchasedate" => sortDir?.ToLower() == "desc"
                    ? Builders<Purchase>.Sort.Descending(p => p.PurchaseDate)
                    : Builders<Purchase>.Sort.Ascending(p => p.PurchaseDate),
                "status" => sortDir?.ToLower() == "desc"
                    ? Builders<Purchase>.Sort.Descending(p => p.Status)
                    : Builders<Purchase>.Sort.Ascending(p => p.Status),
                _ => sortDir?.ToLower() == "desc"
                    ? Builders<Purchase>.Sort.Descending(p => p.CreatedAt)
                    : Builders<Purchase>.Sort.Ascending(p => p.CreatedAt)
            };

            // Apply pagination
            var data = await _purchases.Find(filter)
                .Sort(sort)
                .Skip((page - 1) * pageSize)
                .Limit(pageSize)
                .ToListAsync();

            return (data, (int)total);
        }

        public async Task<Purchase?> GetByIdAsync(string id)
        {
            return await _purchases.Find(p => p.Id == id && p.IsActive).FirstOrDefaultAsync();
        }

        public async Task<Purchase> CreateAsync(Purchase purchase)
        {
            purchase.CreatedAt = DateTime.UtcNow;
            purchase.UpdatedAt = DateTime.UtcNow;
            purchase.PurchaseDate = DateTime.UtcNow;

            // Calculate total amount including discount, tax, and shipping
            var subtotal = purchase.Items.Sum(item => item.TotalCost);
            var discount = purchase.DiscountAmount ?? 0;
            var tax = purchase.TaxAmount ?? 0;
            var shipping = purchase.ShippingCost ?? 0;
            
            purchase.TotalAmount = subtotal - discount + tax + shipping;

            await _purchases.InsertOneAsync(purchase);

            // Update product stock for each item
            foreach (var item in purchase.Items)
            {
                await _productService.UpdateStockAsync(item.ProductId, item.Quantity);
            }

            // Update warehouse stock for each item
            if (!string.IsNullOrEmpty(purchase.WarehouseId))
            {
                foreach (var item in purchase.Items)
                {
                    try
                    {
                        // Get the product to retrieve name and SKU
                        var product = await _productService.GetByIdAsync(item.ProductId);
                        if (product != null)
                        {
                            // Get or create warehouse stock entry
                            var warehouseStocks = await _warehouseStockService.GetByProductAsync(item.ProductId);
                            var existingStock = warehouseStocks.FirstOrDefault(ws => ws.WarehouseId == purchase.WarehouseId);

                            if (existingStock != null)
                            {
                                // Update existing warehouse stock
                                await _warehouseStockService.AdjustQuantityAsync(existingStock.Id!, item.Quantity);
                            }
                            else
                            {
                                // Create new warehouse stock entry
                                var newWarehouseStock = new WarehouseStock
                                {
                                    WarehouseId = purchase.WarehouseId,
                                    WarehouseName = purchase.WarehouseName ?? "Unknown Warehouse",
                                    ProductId = item.ProductId,
                                    ProductName = product.Name,
                                    ProductSKU = product.SKU,
                                    AvailableQuantity = item.Quantity,
                                    ReservedQuantity = 0,
                                    AverageCost = item.UnitCost,
                                    Location = "Default Location",
                                    LastUpdated = DateTime.UtcNow,
                                    CreatedAt = DateTime.UtcNow,
                                    CreatedBy = "System"
                                };
                                await _warehouseStockService.CreateAsync(newWarehouseStock);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Warning: Failed to update warehouse stock for product {item.ProductId}: {ex.Message}");
                    }
                }
            }

            // Create supplier ledger entry for this purchase
            try
            {
                await _supplierLedgerService.AddPurchaseTransactionAsync(purchase);
            }
            catch (Exception ex)
            {
                // Log the error but don't fail the purchase creation
                // In production, you might want to use a proper logging service
                Console.WriteLine($"Warning: Failed to create supplier ledger entry: {ex.Message}");
            }

            return purchase;
        }

        public async Task<bool> UpdateAsync(string id, Purchase purchase)
        {
            purchase.Id = id;
            purchase.UpdatedAt = DateTime.UtcNow;
            
            // Calculate total amount including discount, tax, and shipping
            var subtotal = purchase.Items.Sum(item => item.TotalCost);
            var discount = purchase.DiscountAmount ?? 0;
            var tax = purchase.TaxAmount ?? 0;
            var shipping = purchase.ShippingCost ?? 0;
            
            purchase.TotalAmount = subtotal - discount + tax + shipping;

            var result = await _purchases.ReplaceOneAsync(p => p.Id == id, purchase);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var update = Builders<Purchase>.Update.Set(p => p.IsActive, false);
            var result = await _purchases.UpdateOneAsync(p => p.Id == id, update);
            return result.ModifiedCount > 0;
        }

        public async Task<List<Purchase>> GetBySupplierAsync(string supplierId)
        {
            return await _purchases.Find(p => p.SupplierId == supplierId && p.IsActive)
                .SortByDescending(p => p.CreatedAt).ToListAsync();
        }

        public async Task<List<Purchase>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var filter = Builders<Purchase>.Filter.And(
                Builders<Purchase>.Filter.Gte(p => p.PurchaseDate, startDate),
                Builders<Purchase>.Filter.Lte(p => p.PurchaseDate, endDate),
                Builders<Purchase>.Filter.Eq(p => p.IsActive, true)
            );
            return await _purchases.Find(filter).SortByDescending(p => p.CreatedAt).ToListAsync();
        }

        public async Task<List<Purchase>> GetByStatusAsync(string status)
        {
            return await _purchases.Find(p => p.Status == status && p.IsActive)
                .SortByDescending(p => p.CreatedAt).ToListAsync();
        }
    }
} 