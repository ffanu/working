using Microsoft.AspNetCore.Mvc;
using InventoryAPI.Services;
using System.Text.Json;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExportController : ControllerBase
    {
        private readonly ProductService _productService;

        private readonly SupplierService _supplierService;
        private readonly CustomerService _customerService;
        private readonly PurchaseService _purchaseService;
        private readonly SaleService _saleService;

        public ExportController(
            ProductService productService,

            SupplierService supplierService,
            CustomerService customerService,
            PurchaseService purchaseService,
            SaleService saleService)
        {
            _productService = productService;

            _supplierService = supplierService;
            _customerService = customerService;
            _purchaseService = purchaseService;
            _saleService = saleService;
        }

        [HttpGet("all")]
        public async Task<IActionResult> ExportAllData()
        {
            try
            {
                var exportData = new
                {
                    ExportDate = DateTime.UtcNow,
                    Products = await _productService.GetAllAsync(),

                    Purchases = await _purchaseService.GetAllAsync(),
                    Sales = await _saleService.GetAllAsync(),
                    Suppliers = await _supplierService.GetAllAsync(),
                    Customers = await _customerService.GetAllAsync()
                };

                var jsonString = JsonSerializer.Serialize(exportData, new JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var fileName = $"inventory_export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.json";
                
                return File(
                    System.Text.Encoding.UTF8.GetBytes(jsonString),
                    "application/json",
                    fileName
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("products")]
        public async Task<IActionResult> ExportProducts()
        {
            try
            {
                var products = await _productService.GetAllAsync();
                var jsonString = JsonSerializer.Serialize(products, new JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var fileName = $"products_export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.json";
                
                return File(
                    System.Text.Encoding.UTF8.GetBytes(jsonString),
                    "application/json",
                    fileName
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }



        [HttpGet("purchases")]
        public async Task<IActionResult> ExportPurchases()
        {
            try
            {
                var purchases = await _purchaseService.GetAllAsync();
                var jsonString = JsonSerializer.Serialize(purchases, new JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var fileName = $"purchases_export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.json";
                
                return File(
                    System.Text.Encoding.UTF8.GetBytes(jsonString),
                    "application/json",
                    fileName
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("suppliers")]
        public async Task<IActionResult> ExportSuppliers()
        {
            try
            {
                var suppliers = await _supplierService.GetAllAsync();
                var jsonString = JsonSerializer.Serialize(suppliers, new JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var fileName = $"suppliers_export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.json";
                
                return File(
                    System.Text.Encoding.UTF8.GetBytes(jsonString),
                    "application/json",
                    fileName
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("customers")]
        public async Task<IActionResult> ExportCustomers()
        {
            try
            {
                var customers = await _customerService.GetAllAsync();
                var jsonString = JsonSerializer.Serialize(customers, new JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var fileName = $"customers_export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.json";
                
                return File(
                    System.Text.Encoding.UTF8.GetBytes(jsonString),
                    "application/json",
                    fileName
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("sales")]
        public async Task<IActionResult> ExportSales()
        {
            try
            {
                var sales = await _saleService.GetAllAsync();
                var jsonString = JsonSerializer.Serialize(sales, new JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var fileName = $"sales_export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.json";
                
                return File(
                    System.Text.Encoding.UTF8.GetBytes(jsonString),
                    "application/json",
                    fileName
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
} 