using MongoDB.Driver;
using InventoryAPI.Models;

namespace InventoryAPI.Services
{
    public class WarehouseStockService
    {
        private readonly IMongoCollection<WarehouseStock> _warehouseStocks;
        private readonly DatabaseService _databaseService;

        public WarehouseStockService(DatabaseService databaseService)
        {
            _warehouseStocks = databaseService.WarehouseStocks;
            _databaseService = databaseService;
        }

        public async Task<List<WarehouseStock>> GetAllAsync()
        {
            return await _warehouseStocks.Find(_ => true).ToListAsync();
        }

        public async Task<WarehouseStock?> GetByIdAsync(string id)
        {
            return await _warehouseStocks.Find(ws => ws.Id == id).FirstOrDefaultAsync();
        }

        public async Task<List<WarehouseStock>> GetByWarehouseAsync(string warehouseId)
        {
            return await _warehouseStocks
                .Find(ws => ws.WarehouseId == warehouseId)
                .SortBy(ws => ws.ProductName)
                .ToListAsync();
        }

        public async Task<List<WarehouseStock>> GetByProductAsync(string productId)
        {
            return await _warehouseStocks
                .Find(ws => ws.ProductId == productId)
                .SortBy(ws => ws.WarehouseName)
                .ToListAsync();
        }

        public async Task<List<WarehouseStock>> GetLowStockAsync(int threshold = 5)
        {
            return await _warehouseStocks
                .Find(ws => ws.AvailableQuantity <= threshold)
                .SortBy(ws => ws.AvailableQuantity)
                .ToListAsync();
        }

        public async Task<List<WarehouseStock>> GetOutOfStockAsync()
        {
            return await _warehouseStocks
                .Find(ws => ws.AvailableQuantity == 0)
                .SortBy(ws => ws.WarehouseName)
                .ToListAsync();
        }

        public async Task<WarehouseStock> CreateAsync(WarehouseStock warehouseStock)
        {
            warehouseStock.CreatedAt = DateTime.UtcNow;
            warehouseStock.LastUpdated = DateTime.UtcNow;
            await _warehouseStocks.InsertOneAsync(warehouseStock);
            return warehouseStock;
        }

        public async Task<bool> UpdateAsync(string id, WarehouseStock warehouseStock)
        {
            warehouseStock.Id = id;
            warehouseStock.LastUpdated = DateTime.UtcNow;
            var result = await _warehouseStocks.ReplaceOneAsync(ws => ws.Id == id, warehouseStock);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _warehouseStocks.DeleteOneAsync(ws => ws.Id == id);
            return result.DeletedCount > 0;
        }

        public async Task<bool> AdjustQuantityAsync(string id, int quantity)
        {
            var warehouseStock = await GetByIdAsync(id);
            if (warehouseStock == null)
                return false;

            warehouseStock.AvailableQuantity += quantity;
            warehouseStock.LastUpdated = DateTime.UtcNow;

            if (warehouseStock.AvailableQuantity < 0)
                return false;

            return await UpdateAsync(id, warehouseStock);
        }

        public async Task<object> GetPagedAsync(
            string? search = null,
            string? warehouseId = null,
            string? productId = null,
            string? sortBy = null,
            string? sortDir = "asc",
            int page = 1,
            int pageSize = 20)
        {
            var filter = Builders<WarehouseStock>.Filter.Empty;

            if (!string.IsNullOrEmpty(warehouseId))
            {
                filter = Builders<WarehouseStock>.Filter.And(filter, 
                    Builders<WarehouseStock>.Filter.Eq(ws => ws.WarehouseId, warehouseId));
            }

            if (!string.IsNullOrEmpty(productId))
            {
                filter = Builders<WarehouseStock>.Filter.And(filter, 
                    Builders<WarehouseStock>.Filter.Eq(ws => ws.ProductId, productId));
            }

            if (!string.IsNullOrEmpty(search))
            {
                var searchFilter = Builders<WarehouseStock>.Filter.Or(
                    Builders<WarehouseStock>.Filter.Regex(ws => ws.ProductName, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<WarehouseStock>.Filter.Regex(ws => ws.WarehouseName, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<WarehouseStock>.Filter.Regex(ws => ws.ProductSKU, new MongoDB.Bson.BsonRegularExpression(search, "i"))
                );
                filter = Builders<WarehouseStock>.Filter.And(filter, searchFilter);
            }

            var sort = Builders<WarehouseStock>.Sort.Ascending(ws => ws.WarehouseName).Ascending(ws => ws.ProductName);
            if (!string.IsNullOrEmpty(sortBy))
            {
                sort = sortDir.ToLower() == "desc" 
                    ? Builders<WarehouseStock>.Sort.Descending(sortBy)
                    : Builders<WarehouseStock>.Sort.Ascending(sortBy);
            }

            var total = await _warehouseStocks.CountDocumentsAsync(filter);
            var warehouseStocks = await _warehouseStocks.Find(filter)
                .Sort(sort)
                .Skip((page - 1) * pageSize)
                .Limit(pageSize)
                .ToListAsync();

            return new { data = warehouseStocks, total };
        }

        public async Task<object> GetSummaryAsync()
        {
            var totalProducts = await _warehouseStocks.CountDocumentsAsync(_ => true);
            var totalWarehouses = await _warehouseStocks.Distinct(ws => ws.WarehouseId, _ => true).ToListAsync();
            var lowStockCount = await _warehouseStocks.CountDocumentsAsync(ws => ws.AvailableQuantity <= 5);
            var outOfStockCount = await _warehouseStocks.CountDocumentsAsync(ws => ws.AvailableQuantity == 0);

            var totalValue = await _warehouseStocks.Aggregate()
                .Group(_ => true, g => new { TotalValue = g.Sum(ws => ws.AvailableQuantity * ws.AverageCost) })
                .FirstOrDefaultAsync();

            return new
            {
                totalProducts,
                totalWarehouses = totalWarehouses.Count,
                lowStockCount,
                outOfStockCount,
                totalValue = totalValue?.TotalValue ?? 0
            };
        }

        // NEW: Enhanced stock allocation methods for warehouse-sale relationship
        public async Task<WarehouseStock?> GetByProductAndWarehouseAsync(string productId, string warehouseId)
        {
            return await _warehouseStocks
                .Find(ws => ws.ProductId == productId && ws.WarehouseId == warehouseId)
                .FirstOrDefaultAsync();
        }

        public async Task<List<WarehouseStock>> GetAvailableStockAsync(string productId, int requiredQuantity)
        {
            return await _warehouseStocks
                .Find(ws => ws.ProductId == productId && ws.AvailableQuantity >= requiredQuantity)
                .SortByDescending(ws => ws.AvailableQuantity)
                .ToListAsync();
        }

        public async Task<StockAllocationResult> AllocateStockAsync(string productId, int quantity, string? preferredWarehouseId = null)
        {
            var availableStocks = await GetAvailableStockAsync(productId, 1);
            
            if (!availableStocks.Any())
            {
                return new StockAllocationResult
                {
                    Success = false,
                    Message = "No stock available for this product",
                    Allocations = new List<StockAllocation>()
                };
            }

            var allocations = new List<StockAllocation>();
            var remainingQuantity = quantity;

            // Try preferred warehouse first
            if (!string.IsNullOrEmpty(preferredWarehouseId))
            {
                var preferredStock = availableStocks.FirstOrDefault(ws => ws.WarehouseId == preferredWarehouseId);
                if (preferredStock != null && preferredStock.AvailableQuantity > 0)
                {
                    var allocatedFromPreferred = Math.Min(remainingQuantity, preferredStock.AvailableQuantity);
                    allocations.Add(new StockAllocation
                    {
                        WarehouseId = preferredStock.WarehouseId,
                        WarehouseName = preferredStock.WarehouseName,
                        AllocatedQuantity = allocatedFromPreferred,
                        AvailableQuantity = preferredStock.AvailableQuantity
                    });
                    remainingQuantity -= allocatedFromPreferred;
                }
            }

            // Allocate from other warehouses if needed
            foreach (var stock in availableStocks.Where(ws => ws.WarehouseId != preferredWarehouseId))
            {
                if (remainingQuantity <= 0) break;

                var allocatedQuantity = Math.Min(remainingQuantity, stock.AvailableQuantity);
                allocations.Add(new StockAllocation
                {
                    WarehouseId = stock.WarehouseId,
                    WarehouseName = stock.WarehouseName,
                    AllocatedQuantity = allocatedQuantity,
                    AvailableQuantity = stock.AvailableQuantity
                });
                remainingQuantity -= allocatedQuantity;
            }

            return new StockAllocationResult
            {
                Success = remainingQuantity == 0,
                Message = remainingQuantity == 0 ? "Stock allocated successfully" : $"Only {quantity - remainingQuantity} of {quantity} items could be allocated",
                Allocations = allocations,
                UnallocatedQuantity = remainingQuantity
            };
        }

        public async Task<bool> ReserveStockAsync(string productId, string warehouseId, int quantity)
        {
            var stock = await GetByProductAndWarehouseAsync(productId, warehouseId);
            if (stock == null || stock.AvailableQuantity < quantity)
                return false;

            stock.AvailableQuantity -= quantity;
            stock.ReservedQuantity += quantity;
            stock.LastUpdated = DateTime.UtcNow;

            return await UpdateAsync(stock.Id!, stock);
        }

        public async Task<bool> ConfirmStockReservationAsync(string productId, string warehouseId, int quantity)
        {
            var stock = await GetByProductAndWarehouseAsync(productId, warehouseId);
            if (stock == null || stock.ReservedQuantity < quantity)
                return false;

            stock.ReservedQuantity -= quantity;
            stock.LastUpdated = DateTime.UtcNow;

            return await UpdateAsync(stock.Id!, stock);
        }

        public async Task<bool> ReleaseStockReservationAsync(string productId, string warehouseId, int quantity)
        {
            var stock = await GetByProductAndWarehouseAsync(productId, warehouseId);
            if (stock == null || stock.ReservedQuantity < quantity)
                return false;

            stock.ReservedQuantity -= quantity;
            stock.AvailableQuantity += quantity;
            stock.LastUpdated = DateTime.UtcNow;

            return await UpdateAsync(stock.Id!, stock);
        }

        public async Task<bool> CanFulfillSaleAsync(List<SaleItem> items)
        {
            foreach (var item in items)
            {
                var totalAvailable = await _warehouseStocks
                    .Find(ws => ws.ProductId == item.ProductId)
                    .ToListAsync();

                var totalStock = totalAvailable.Sum(ws => ws.AvailableQuantity);
                
                if (totalStock < item.Quantity)
                    return false;
            }
            return true;
        }

        // NEW: Warehouse-wise stock methods
        public async Task<object> GetWarehouseWiseStocksAsync(
            string? search = null,
            string? sortBy = null,
            string? sortDir = "asc",
            int page = 1,
            int pageSize = 20)
        {
            // Get all warehouses first
            var warehouses = await _warehouseStocks.Distinct(ws => ws.WarehouseId, _ => true).ToListAsync();
            var warehouseStocks = await _warehouseStocks.Find(_ => true).ToListAsync();

            // Group by warehouse
            var warehouseGroups = warehouseStocks
                .GroupBy(ws => new { ws.WarehouseId, ws.WarehouseName })
                .Select(g => new
                {
                    WarehouseId = g.Key.WarehouseId,
                    WarehouseName = g.Key.WarehouseName,
                    TotalProducts = g.Count(),
                    TotalQuantity = g.Sum(ws => ws.TotalQuantity),
                    AvailableQuantity = g.Sum(ws => ws.AvailableQuantity),
                    ReservedQuantity = g.Sum(ws => ws.ReservedQuantity),
                    TotalValue = g.Sum(ws => ws.AvailableQuantity * ws.AverageCost),
                    LowStockItems = g.Count(ws => ws.IsLowStock),
                    OutOfStockItems = g.Count(ws => ws.IsOutOfStock),
                    Products = g.OrderBy(ws => ws.ProductName).ToList()
                })
                .ToList();

            // Apply search filter
            if (!string.IsNullOrEmpty(search))
            {
                warehouseGroups = warehouseGroups
                    .Where(wg => wg.WarehouseName.ToLower().Contains(search.ToLower()))
                    .ToList();
            }

            // Apply sorting
            if (!string.IsNullOrEmpty(sortBy))
            {
                var isDesc = sortDir.ToLower() == "desc";
                warehouseGroups = sortBy.ToLower() switch
                {
                    "warehousename" => isDesc ? warehouseGroups.OrderByDescending(wg => wg.WarehouseName).ToList()
                                            : warehouseGroups.OrderBy(wg => wg.WarehouseName).ToList(),
                    "totalproducts" => isDesc ? warehouseGroups.OrderByDescending(wg => wg.TotalProducts).ToList()
                                            : warehouseGroups.OrderBy(wg => wg.TotalProducts).ToList(),
                    "totalquantity" => isDesc ? warehouseGroups.OrderByDescending(wg => wg.TotalQuantity).ToList()
                                            : warehouseGroups.OrderBy(wg => wg.TotalQuantity).ToList(),
                    "totalvalue" => isDesc ? warehouseGroups.OrderByDescending(wg => wg.TotalValue).ToList()
                                         : warehouseGroups.OrderBy(wg => wg.TotalValue).ToList(),
                    _ => warehouseGroups
                };
            }

            var total = warehouseGroups.Count;
            var pagedData = warehouseGroups
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return new { data = pagedData, total };
        }

        public async Task<object> GetWarehouseWiseSummaryAsync()
        {
            var warehouseStocks = await _warehouseStocks.Find(_ => true).ToListAsync();
            var warehouses = warehouseStocks.GroupBy(ws => new { ws.WarehouseId, ws.WarehouseName });

            var totalWarehouses = warehouses.Count();
            var totalProducts = warehouseStocks.Count();
            var totalQuantity = warehouseStocks.Sum(ws => ws.TotalQuantity);
            var totalValue = warehouseStocks.Sum(ws => ws.AvailableQuantity * ws.AverageCost);
            var lowStockItems = warehouseStocks.Count(ws => ws.IsLowStock);
            var outOfStockItems = warehouseStocks.Count(ws => ws.IsOutOfStock);

            var warehouseStats = warehouses.Select(w => new
            {
                WarehouseId = w.Key.WarehouseId,
                WarehouseName = w.Key.WarehouseName,
                ProductCount = w.Count(),
                TotalQuantity = w.Sum(ws => ws.TotalQuantity),
                TotalValue = w.Sum(ws => ws.AvailableQuantity * ws.AverageCost),
                LowStockCount = w.Count(ws => ws.IsLowStock),
                OutOfStockCount = w.Count(ws => ws.IsOutOfStock)
            }).OrderByDescending(w => w.TotalValue).ToList();

            return new
            {
                totalWarehouses,
                totalProducts,
                totalQuantity,
                totalValue,
                lowStockItems,
                outOfStockItems,
                warehouseStats
            };
        }

        // NEW: Shop-wise stock methods
        public async Task<object> GetShopWiseStocksAsync(
            string? search = null,
            string? sortBy = null,
            string? sortDir = "asc",
            int page = 1,
            int pageSize = 20)
        {
            // Get all warehouse stocks and warehouses
            var warehouseStocks = await _warehouseStocks.Find(_ => true).ToListAsync();
            var warehouses = await _databaseService.Warehouses.Find(_ => true).ToListAsync();
            var shops = await _databaseService.Shops.Find(_ => true).ToListAsync();
            
            // Create lookup dictionaries
            var warehouseToShop = warehouses
                .Where(w => !string.IsNullOrEmpty(w.ShopId))
                .ToDictionary(w => w.Id, w => new { ShopId = w.ShopId, ShopName = w.ShopName });
            
            var shopLookup = shops.ToDictionary(s => s.Id, s => s.Name);
            
            // Filter warehouse stocks to include:
            // 1. Stocks that belong to warehouses that have a ShopId
            // 2. Stocks that belong directly to shop IDs (warehouseId is actually a shop ID)
            var shopWarehouseStocks = warehouseStocks
                .Where(ws => warehouseToShop.ContainsKey(ws.WarehouseId) || shopLookup.ContainsKey(ws.WarehouseId))
                .Select(ws => new
                {
                    Stock = ws,
                    ShopId = warehouseToShop.ContainsKey(ws.WarehouseId) 
                        ? warehouseToShop[ws.WarehouseId].ShopId 
                        : ws.WarehouseId,
                    ShopName = warehouseToShop.ContainsKey(ws.WarehouseId)
                        ? warehouseToShop[ws.WarehouseId].ShopName
                        : shopLookup.ContainsKey(ws.WarehouseId) ? shopLookup[ws.WarehouseId] : ws.WarehouseName
                })
                .ToList();
            
            // Group by shop
            var shopGroups = shopWarehouseStocks
                .GroupBy(ws => new { 
                    ShopId = ws.ShopId,
                    ShopName = ws.ShopName
                })
                .Select(g => new
                {
                    ShopId = g.Key.ShopId,
                    ShopName = g.Key.ShopName,
                    TotalProducts = g.Count(),
                    TotalQuantity = g.Sum(ws => ws.Stock.TotalQuantity),
                    AvailableQuantity = g.Sum(ws => ws.Stock.AvailableQuantity),
                    ReservedQuantity = g.Sum(ws => ws.Stock.ReservedQuantity),
                    TotalValue = g.Sum(ws => ws.Stock.AvailableQuantity * ws.Stock.AverageCost),
                    LowStockItems = g.Count(ws => ws.Stock.IsLowStock),
                    OutOfStockItems = g.Count(ws => ws.Stock.IsOutOfStock),
                    Products = g.Select(ws => ws.Stock).OrderBy(s => s.ProductName).ToList()
                })
                .ToList();

            // Apply search filter
            if (!string.IsNullOrEmpty(search))
            {
                shopGroups = shopGroups
                    .Where(sg => sg.ShopName.ToLower().Contains(search.ToLower()))
                    .ToList();
            }

            // Apply sorting
            if (!string.IsNullOrEmpty(sortBy))
            {
                var isDesc = sortDir.ToLower() == "desc";
                shopGroups = sortBy.ToLower() switch
                {
                    "shopname" => isDesc ? shopGroups.OrderByDescending(sg => sg.ShopName).ToList()
                                        : shopGroups.OrderBy(sg => sg.ShopName).ToList(),
                    "totalproducts" => isDesc ? shopGroups.OrderByDescending(sg => sg.TotalProducts).ToList()
                                            : shopGroups.OrderBy(sg => sg.TotalProducts).ToList(),
                    "totalquantity" => isDesc ? shopGroups.OrderByDescending(sg => sg.TotalQuantity).ToList()
                                            : shopGroups.OrderBy(sg => sg.TotalQuantity).ToList(),
                    "totalvalue" => isDesc ? shopGroups.OrderByDescending(sg => sg.TotalValue).ToList()
                                         : shopGroups.OrderBy(sg => sg.TotalValue).ToList(),
                    _ => shopGroups
                };
            }

            var total = shopGroups.Count;
            var pagedData = shopGroups
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return new { data = pagedData, total };
        }

        public async Task<object> GetShopWiseSummaryAsync()
        {
            // Get all warehouse stocks and warehouses
            var warehouseStocks = await _warehouseStocks.Find(_ => true).ToListAsync();
            var warehouses = await _databaseService.Warehouses.Find(_ => true).ToListAsync();
            var shops = await _databaseService.Shops.Find(_ => true).ToListAsync();
            
            // Create a lookup for warehouse to shop mapping
            var warehouseToShop = warehouses
                .Where(w => !string.IsNullOrEmpty(w.ShopId))
                .ToDictionary(w => w.Id, w => new { ShopId = w.ShopId, ShopName = w.ShopName });
            
            // Filter warehouse stocks to only include those that belong to shops
            var shopWarehouseStocks = warehouseStocks
                .Where(ws => warehouseToShop.ContainsKey(ws.WarehouseId))
                .ToList();
            
            var shopGroups = shopWarehouseStocks.GroupBy(ws => new { 
                ShopId = warehouseToShop[ws.WarehouseId].ShopId,
                ShopName = warehouseToShop[ws.WarehouseId].ShopName
            });

            var totalShops = shopGroups.Count();
            var totalProducts = shopWarehouseStocks.Count();
            var totalQuantity = shopWarehouseStocks.Sum(ws => ws.TotalQuantity);
            var totalValue = shopWarehouseStocks.Sum(ws => ws.AvailableQuantity * ws.AverageCost);
            var lowStockItems = shopWarehouseStocks.Count(ws => ws.IsLowStock);
            var outOfStockItems = shopWarehouseStocks.Count(ws => ws.IsOutOfStock);

            var shopStats = shopGroups.Select(s => new
            {
                ShopId = s.Key.ShopId,
                ShopName = s.Key.ShopName,
                ProductCount = s.Count(),
                TotalQuantity = s.Sum(ws => ws.TotalQuantity),
                TotalValue = s.Sum(ws => ws.AvailableQuantity * ws.AverageCost),
                LowStockCount = s.Count(ws => ws.IsLowStock),
                OutOfStockCount = s.Count(ws => ws.IsOutOfStock)
            }).OrderByDescending(s => s.TotalValue).ToList();

            return new
            {
                totalShops,
                totalProducts,
                totalQuantity,
                totalValue,
                lowStockItems,
                outOfStockItems,
                shopStats
            };
        }
    }

    // NEW: Supporting classes for stock allocation
    public class StockAllocationResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<StockAllocation> Allocations { get; set; } = new List<StockAllocation>();
        public int UnallocatedQuantity { get; set; }
    }

    public class StockAllocation
    {
        public string WarehouseId { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
        public int AllocatedQuantity { get; set; }
        public int AvailableQuantity { get; set; }
    }
}


