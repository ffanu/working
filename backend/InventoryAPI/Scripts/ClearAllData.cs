using MongoDB.Driver;
using InventoryAPI.Services;

namespace InventoryAPI.Scripts
{
    public class ClearAllData
    {
        private readonly DatabaseService _databaseService;
        private readonly ProductService _productService;
        private readonly WarehouseService _warehouseService;
        private readonly BatchService _batchService;
        private readonly CustomerService _customerService;
        private readonly SupplierService _supplierService;
        private readonly PurchaseService _purchaseService;
        private readonly SaleService _saleService;

        public ClearAllData(
            DatabaseService databaseService,
            ProductService productService,
            WarehouseService warehouseService,
            BatchService batchService,
            CustomerService customerService,
            SupplierService supplierService,
            PurchaseService purchaseService,
            SaleService saleService)
        {
            _databaseService = databaseService;
            _productService = productService;
            _warehouseService = warehouseService;
            _batchService = batchService;
            _customerService = customerService;
            _supplierService = supplierService;
            _purchaseService = purchaseService;
            _saleService = saleService;
        }

        public async Task ClearAllAsync()
        {
            try
            {
                Console.WriteLine("Starting complete data cleanup...");

                // Clear all collections
                await _databaseService.Products.DeleteManyAsync(_ => true);
                await _databaseService.Warehouses.DeleteManyAsync(_ => true);
                await _databaseService.Shops.DeleteManyAsync(_ => true);
                await _databaseService.Batches.DeleteManyAsync(_ => true);
                await _databaseService.Customers.DeleteManyAsync(_ => true);
                await _databaseService.Suppliers.DeleteManyAsync(_ => true);
                await _databaseService.Purchases.DeleteManyAsync(_ => true);
                await _databaseService.Sales.DeleteManyAsync(_ => true);
                await _databaseService.StockLedger.DeleteManyAsync(_ => true);
                await _databaseService.CustomerLedger.DeleteManyAsync(_ => true);
                await _databaseService.SupplierLedger.DeleteManyAsync(_ => true);
                await _databaseService.WarehouseStocks.DeleteManyAsync(_ => true);
                await _databaseService.TransferOrders.DeleteManyAsync(_ => true);
                await _databaseService.Categories.DeleteManyAsync(_ => true);
                await _databaseService.Refunds.DeleteManyAsync(_ => true);
                await _databaseService.CashRegisters.DeleteManyAsync(_ => true);
                await _databaseService.CashTransactions.DeleteManyAsync(_ => true);
                await _databaseService.Users.DeleteManyAsync(_ => true);

                Console.WriteLine("✅ All data cleared successfully!");
                Console.WriteLine($"- Products: 0");
                Console.WriteLine($"- Warehouses: 0");
                Console.WriteLine($"- Shops: 0");
                Console.WriteLine($"- Transfer Orders: 0");
                Console.WriteLine($"- Batches: 0");
                Console.WriteLine($"- Customers: 0");
                Console.WriteLine($"- Suppliers: 0");
                Console.WriteLine($"- Purchases: 0");
                Console.WriteLine($"- Sales: 0");
                Console.WriteLine($"- Refunds: 0");
                Console.WriteLine($"- Warehouse Stocks: 0");
                Console.WriteLine($"- Stock Ledgers: 0");
                Console.WriteLine($"- Customer Ledgers: 0");
                Console.WriteLine($"- Supplier Ledgers: 0");
                Console.WriteLine($"- Categories: 0");
                Console.WriteLine($"- Cash Registers: 0");
                Console.WriteLine($"- Cash Transactions: 0");
                Console.WriteLine($"- Users: 0");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error clearing data: {ex.Message}");
                throw;
            }
        }
    }
}


