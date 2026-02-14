using MongoDB.Driver;
using InventoryAPI.Models;

namespace InventoryAPI.Services
{
    public class TransferOrderService
    {
        private readonly IMongoCollection<TransferOrder> _transferOrders;
        private readonly IMongoCollection<WarehouseStock> _warehouseStocks;
        private readonly IMongoCollection<Product> _products;
        private readonly IMongoCollection<Warehouse> _warehouses;
        private readonly IMongoCollection<Shop> _shops;
        private readonly StockInitializationService _stockService;

        public TransferOrderService(DatabaseService databaseService, StockInitializationService stockService)
        {
            _transferOrders = databaseService.TransferOrders;
            _warehouseStocks = databaseService.WarehouseStocks;
            _products = databaseService.Products;
            _warehouses = databaseService.Warehouses;
            _shops = databaseService.Shops;
            _stockService = stockService;
        }

        public async Task<List<TransferOrder>> GetAllAsync()
        {
            return await _transferOrders
                .Find(_ => true)
                .SortByDescending(to => to.RequestDate)
                .ToListAsync();
        }

        public async Task<TransferOrder?> GetByIdAsync(string id)
        {
            return await _transferOrders.Find(to => to.Id == id).FirstOrDefaultAsync();
        }

        public async Task<List<TransferOrder>> GetByStatusAsync(string status)
        {
            return await _transferOrders
                .Find(to => to.Status == status)
                .SortByDescending(to => to.RequestDate)
                .ToListAsync();
        }

        public async Task<List<TransferOrder>> GetByLocationAsync(string locationId, bool isFromLocation = true)
        {
            var filter = isFromLocation
                ? Builders<TransferOrder>.Filter.Eq(to => to.FromLocationId, locationId)
                : Builders<TransferOrder>.Filter.Eq(to => to.ToLocationId, locationId);

            return await _transferOrders
                .Find(filter)
                .SortByDescending(to => to.RequestDate)
                .ToListAsync();
        }

        public async Task<TransferOrder> CreateAsync(TransferOrder transferOrder)
        {
            // Validate locations exist
            await ValidateLocationsAsync(transferOrder);
            
            // Validate stock availability in source location
            await ValidateStockAvailabilityAsync(transferOrder);
            
            // Generate transfer number
            transferOrder.TransferNumber = await GenerateTransferNumberAsync();
            
            // Set default values
            transferOrder.CreatedAt = DateTime.UtcNow;
            transferOrder.UpdatedAt = DateTime.UtcNow;
            transferOrder.Status = "Pending";
            transferOrder.RequestDate = DateTime.UtcNow;

            // Note: TotalItems and TotalValue are computed properties, no need to set them manually

            Console.WriteLine($"Inserting transfer order: {transferOrder.TransferNumber}");
            await _transferOrders.InsertOneAsync(transferOrder);
            Console.WriteLine($"Transfer order inserted with ID: {transferOrder.Id}");
            return transferOrder;
        }

        public async Task<bool> UpdateAsync(string id, TransferOrder transferOrder)
        {
            transferOrder.UpdatedAt = DateTime.UtcNow;
            var result = await _transferOrders.ReplaceOneAsync(to => to.Id == id, transferOrder);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _transferOrders.DeleteOneAsync(to => to.Id == id);
            return result.DeletedCount > 0;
        }

        public async Task<bool> ApproveAsync(string id, string approvedBy)
        {
            var transferOrder = await GetByIdAsync(id);
            if (transferOrder == null || transferOrder.Status != "Pending")
                return false;

            transferOrder.Status = "InProgress";
            transferOrder.ApprovedBy = approvedBy;
            transferOrder.UpdatedAt = DateTime.UtcNow;

            return await UpdateAsync(id, transferOrder);
        }

        public async Task<bool> CompleteAsync(string id)
        {
            var transferOrder = await GetByIdAsync(id);
            if (transferOrder == null || transferOrder.Status != "InProgress")
                return false;

            // Execute the transfer
            foreach (var item in transferOrder.Items)
            {
                await _stockService.TransferStockAsync(
                    item.ProductId,
                    transferOrder.FromLocationId,
                    transferOrder.ToLocationId,
                    item.Quantity
                );

                // Update transferred quantity
                item.TransferredQuantity = item.Quantity;
            }

            transferOrder.Status = "Completed";
            transferOrder.CompletedDate = DateTime.UtcNow;
            transferOrder.UpdatedAt = DateTime.UtcNow;

            return await UpdateAsync(id, transferOrder);
        }

        public async Task<bool> CancelAsync(string id)
        {
            var transferOrder = await GetByIdAsync(id);
            if (transferOrder == null || transferOrder.Status == "Completed")
                return false;

            transferOrder.Status = "Cancelled";
            transferOrder.UpdatedAt = DateTime.UtcNow;

            return await UpdateAsync(id, transferOrder);
        }

        public async Task<object> GetSummaryAsync()
        {
            var total = await _transferOrders.CountDocumentsAsync(_ => true);
            var pending = await _transferOrders.CountDocumentsAsync(to => to.Status == "Pending");
            var inProgress = await _transferOrders.CountDocumentsAsync(to => to.Status == "InProgress");
            var completed = await _transferOrders.CountDocumentsAsync(to => to.Status == "Completed");
            var cancelled = await _transferOrders.CountDocumentsAsync(to => to.Status == "Cancelled");

            return new
            {
                total,
                pending,
                inProgress,
                completed,
                cancelled
            };
        }

        private async Task<string> GenerateTransferNumberAsync()
        {
            var today = DateTime.UtcNow.ToString("yyyyMMdd");
            var count = await _transferOrders.CountDocumentsAsync(to => to.TransferNumber.StartsWith($"TO-{today}"));
            return $"TO-{today}-{(count + 1):D4}";
        }

        private async Task ValidateLocationsAsync(TransferOrder transferOrder)
        {
            // Validate from location
            if (transferOrder.FromLocationType == "warehouse")
            {
                var warehouse = await _warehouses.Find(w => w.Id == transferOrder.FromLocationId).FirstOrDefaultAsync();
                if (warehouse == null)
                    throw new ArgumentException($"Warehouse {transferOrder.FromLocationId} not found");
                transferOrder.FromLocationName = warehouse.Name;
            }
            else if (transferOrder.FromLocationType == "shop")
            {
                var shop = await _shops.Find(s => s.Id == transferOrder.FromLocationId).FirstOrDefaultAsync();
                if (shop == null)
                    throw new ArgumentException($"Shop {transferOrder.FromLocationId} not found");
                transferOrder.FromLocationName = shop.Name;
            }

            // Validate to location
            if (transferOrder.ToLocationType == "warehouse")
            {
                var warehouse = await _warehouses.Find(w => w.Id == transferOrder.ToLocationId).FirstOrDefaultAsync();
                if (warehouse == null)
                    throw new ArgumentException($"Warehouse {transferOrder.ToLocationId} not found");
                transferOrder.ToLocationName = warehouse.Name;
            }
            else if (transferOrder.ToLocationType == "shop")
            {
                var shop = await _shops.Find(s => s.Id == transferOrder.ToLocationId).FirstOrDefaultAsync();
                if (shop == null)
                    throw new ArgumentException($"Shop {transferOrder.ToLocationId} not found");
                transferOrder.ToLocationName = shop.Name;
            }
        }

        private async Task ValidateStockAvailabilityAsync(TransferOrder transferOrder)
        {
            foreach (var item in transferOrder.Items)
            {
                // Check stock in the source location (warehouse or shop)
                // Note: In this system, both warehouses and shops use the same WarehouseStock collection
                // with WarehouseId pointing to either warehouse ID or shop ID
                var stock = await _warehouseStocks
                    .Find(ws => ws.ProductId == item.ProductId && ws.WarehouseId == transferOrder.FromLocationId)
                    .FirstOrDefaultAsync();

                if (stock == null)
                {
                    throw new InvalidOperationException($"Product {item.ProductName} not found in {transferOrder.FromLocationName} ({transferOrder.FromLocationType})");
                }

                if (stock.AvailableQuantity < item.Quantity)
                {
                    throw new InvalidOperationException($"Insufficient stock for product {item.ProductName} in {transferOrder.FromLocationName}. Available: {stock.AvailableQuantity}, Required: {item.Quantity}");
                }
            }
        }

        public async Task<List<TransferOrder>> GetPendingTransfersAsync()
        {
            return await _transferOrders
                .Find(to => to.Status == "Pending")
                .SortBy(to => to.RequestDate)
                .ToListAsync();
        }

        public async Task<List<TransferOrder>> GetOverdueTransfersAsync()
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-7); // Transfers older than 7 days
            return await _transferOrders
                .Find(to => to.Status == "Pending" && to.RequestDate < cutoffDate)
                .SortBy(to => to.RequestDate)
                .ToListAsync();
        }
    }
}
