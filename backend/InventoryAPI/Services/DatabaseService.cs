using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using InventoryAPI.Models;

namespace InventoryAPI.Services
{
    public class DatabaseService
    {
        private readonly IMongoDatabase _database;
        private readonly IMongoCollection<Product> _products;

        private readonly IMongoCollection<Supplier> _suppliers;
        private readonly IMongoCollection<Customer> _customers;
        private readonly IMongoCollection<Purchase> _purchases;
        private readonly IMongoCollection<Sale> _sales;
        private readonly IMongoCollection<StockLedger> _stockLedger;
        private readonly IMongoCollection<CustomerLedger> _customerLedger;
        private readonly IMongoCollection<SupplierLedger> _supplierLedger;
        private readonly IMongoCollection<User> _users;
        private readonly IMongoCollection<Batch> _batches;
        private readonly IMongoCollection<Warehouse> _warehouses;
        private readonly IMongoCollection<WarehouseStock> _warehouseStocks;
        private readonly IMongoCollection<Category> _categories;
        private readonly IMongoCollection<Refund> _refunds;
        private readonly IMongoCollection<CashRegister> _cashRegisters;
        private readonly IMongoCollection<CashTransaction> _cashTransactions;
        private readonly IMongoCollection<Shop> _shops;
        private readonly IMongoCollection<TransferOrder> _transferOrders;

        public DatabaseService(IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("MongoDB") ?? "mongodb://localhost:27017";
            var client = new MongoClient(connectionString);
            _database = client.GetDatabase("InventoryDB");
            
            _products = _database.GetCollection<Product>("Products");

            _suppliers = _database.GetCollection<Supplier>("Suppliers");
            _customers = _database.GetCollection<Customer>("Customers");
            _purchases = _database.GetCollection<Purchase>("Purchases");
            _sales = _database.GetCollection<Sale>("Sales");
            _stockLedger = _database.GetCollection<StockLedger>("StockLedger");
            _customerLedger = _database.GetCollection<CustomerLedger>("CustomerLedger");
            _supplierLedger = _database.GetCollection<SupplierLedger>("SupplierLedger");
            _users = _database.GetCollection<User>("Users");
            _batches = _database.GetCollection<Batch>("Batches");
            _warehouses = _database.GetCollection<Warehouse>("Warehouses");
            _warehouseStocks = _database.GetCollection<WarehouseStock>("WarehouseStocks");
            _categories = _database.GetCollection<Category>("Categories");
            _refunds = _database.GetCollection<Refund>("Refunds");
            _cashRegisters = _database.GetCollection<CashRegister>("CashRegisters");
            _cashTransactions = _database.GetCollection<CashTransaction>("CashTransactions");
            _shops = _database.GetCollection<Shop>("Shops");
            _transferOrders = _database.GetCollection<TransferOrder>("TransferOrders");
        }

        public IMongoCollection<Product> Products => _products;

        public IMongoCollection<Supplier> Suppliers => _suppliers;
        public IMongoCollection<Customer> Customers => _customers;
        public IMongoCollection<Purchase> Purchases => _purchases;
        public IMongoCollection<Sale> Sales => _sales;
        public IMongoCollection<StockLedger> StockLedger => _stockLedger;
        public IMongoCollection<CustomerLedger> CustomerLedger => _customerLedger;
        public IMongoCollection<SupplierLedger> SupplierLedger => _supplierLedger;
        public IMongoCollection<User> Users => _users;
        public IMongoCollection<Batch> Batches => _batches;
        public IMongoCollection<Warehouse> Warehouses => _warehouses;
        public IMongoCollection<WarehouseStock> WarehouseStocks => _warehouseStocks;
        public IMongoCollection<Category> Categories => _categories;
        public IMongoCollection<Refund> Refunds => _refunds;
        public IMongoCollection<CashRegister> CashRegisters => _cashRegisters;
        public IMongoCollection<CashTransaction> CashTransactions => _cashTransactions;
        public IMongoCollection<Shop> Shops => _shops;
        public IMongoCollection<TransferOrder> TransferOrders => _transferOrders;
        
        public IMongoDatabase Database => _database;
    }
} 