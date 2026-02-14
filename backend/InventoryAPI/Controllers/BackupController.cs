using Microsoft.AspNetCore.Mvc;
using InventoryAPI.Services;
using System.Text.Json;
using MongoDB.Driver;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BackupController : ControllerBase
    {
        private readonly ProductService _productService;

        private readonly SupplierService _supplierService;
        private readonly CustomerService _customerService;
        private readonly PurchaseService _purchaseService;
        private readonly SaleService _saleService;
        private readonly DatabaseService _databaseService;

        public BackupController(
            ProductService productService,

            SupplierService supplierService,
            CustomerService customerService,
            PurchaseService purchaseService,
            SaleService saleService,
            DatabaseService databaseService)
        {
            _productService = productService;

            _supplierService = supplierService;
            _customerService = customerService;
            _purchaseService = purchaseService;
            _saleService = saleService;
            _databaseService = databaseService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateBackup()
        {
            try
            {
                var backupData = new
                {
                    BackupDate = DateTime.UtcNow,
                    Products = await _productService.GetAllAsync(),

                    Purchases = await _purchaseService.GetAllAsync(),
                    Sales = await _saleService.GetAllAsync(),
                    Suppliers = await _supplierService.GetAllAsync(),
                    Customers = await _customerService.GetAllAsync()
                };

                var jsonString = JsonSerializer.Serialize(backupData, new JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var fileName = $"inventory_backup_{DateTime.UtcNow:yyyyMMdd_HHmmss}.json";
                
                return File(
                    System.Text.Encoding.UTF8.GetBytes(jsonString),
                    "application/json",
                    fileName
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Backup creation failed: {ex.Message}");
            }
        }

        [HttpPost("restore")]
        public async Task<IActionResult> RestoreBackup(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No backup file provided");
                }

                using var reader = new StreamReader(file.OpenReadStream());
                var jsonContent = await reader.ReadToEndAsync();
                
                var backupData = JsonSerializer.Deserialize<BackupData>(jsonContent, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                if (backupData == null)
                {
                    return BadRequest("Invalid backup file format");
                }

                // Clear existing data
                await _databaseService.Products.DeleteManyAsync(_ => true);

                await _databaseService.Purchases.DeleteManyAsync(_ => true);
                await _databaseService.Sales.DeleteManyAsync(_ => true);
                await _databaseService.Suppliers.DeleteManyAsync(_ => true);
                await _databaseService.Customers.DeleteManyAsync(_ => true);

                // Restore data
                if (backupData.Products?.Any() == true)
                {
                    await _databaseService.Products.InsertManyAsync(backupData.Products);
                }



                if (backupData.Purchases?.Any() == true)
                {
                    await _databaseService.Purchases.InsertManyAsync(backupData.Purchases);
                }

                if (backupData.Sales?.Any() == true)
                {
                    await _databaseService.Sales.InsertManyAsync(backupData.Sales);
                }

                if (backupData.Suppliers?.Any() == true)
                {
                    await _databaseService.Suppliers.InsertManyAsync(backupData.Suppliers);
                }

                if (backupData.Customers?.Any() == true)
                {
                    await _databaseService.Customers.InsertManyAsync(backupData.Customers);
                }

                return Ok(new { message = "Backup restored successfully", restoredItems = new
                {
                    Products = backupData.Products?.Count ?? 0,

                    Purchases = backupData.Purchases?.Count ?? 0,
                    Sales = backupData.Sales?.Count ?? 0,
                    Suppliers = backupData.Suppliers?.Count ?? 0,
                    Customers = backupData.Customers?.Count ?? 0
                }});
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Backup restoration failed: {ex.Message}");
            }
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearAllData()
        {
            try
            {
                // Clear all collections
                await _databaseService.Products.DeleteManyAsync(_ => true);
                await _databaseService.Purchases.DeleteManyAsync(_ => true);
                await _databaseService.Sales.DeleteManyAsync(_ => true);
                await _databaseService.Suppliers.DeleteManyAsync(_ => true);
                await _databaseService.Customers.DeleteManyAsync(_ => true);
                await _databaseService.StockLedger.DeleteManyAsync(_ => true);
                await _databaseService.CustomerLedger.DeleteManyAsync(_ => true);
                await _databaseService.SupplierLedger.DeleteManyAsync(_ => true);
                await _databaseService.Users.DeleteManyAsync(_ => true);
                await _databaseService.Batches.DeleteManyAsync(_ => true);
                await _databaseService.Warehouses.DeleteManyAsync(_ => true);
                await _databaseService.WarehouseStocks.DeleteManyAsync(_ => true);
                await _databaseService.Categories.DeleteManyAsync(_ => true);
                await _databaseService.Refunds.DeleteManyAsync(_ => true);
                await _databaseService.CashRegisters.DeleteManyAsync(_ => true);
                await _databaseService.CashTransactions.DeleteManyAsync(_ => true);
                await _databaseService.Shops.DeleteManyAsync(_ => true);
                await _databaseService.TransferOrders.DeleteManyAsync(_ => true);

                return Ok(new { message = "All data cleared successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Data clearing failed: {ex.Message}");
            }
        }
    }

    public class BackupData
    {
        public DateTime BackupDate { get; set; }
        public List<InventoryAPI.Models.Product>? Products { get; set; }

        public List<InventoryAPI.Models.Purchase>? Purchases { get; set; }
        public List<InventoryAPI.Models.Sale>? Sales { get; set; }
        public List<InventoryAPI.Models.Supplier>? Suppliers { get; set; }
        public List<InventoryAPI.Models.Customer>? Customers { get; set; }
    }
} 