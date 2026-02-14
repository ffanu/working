using Microsoft.AspNetCore.Mvc;
using InventoryAPI.Scripts;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SeedController : ControllerBase
    {
        private readonly SeedData _seedData;
        private readonly SeedWarehouses _seedWarehouses;
        private readonly SeedBatches _seedBatches;
        private readonly SeedEnhancedProducts _seedEnhancedProducts;
        private readonly SeedWarehouseStocks _seedWarehouseStocks;
        private readonly SeedShops _seedShops;
        private readonly ClearAllData _clearAllData;

        public SeedController(
            SeedData seedData, 
            SeedWarehouses seedWarehouses,
            SeedBatches seedBatches,
            SeedEnhancedProducts seedEnhancedProducts,
            SeedWarehouseStocks seedWarehouseStocks,
            SeedShops seedShops,
            ClearAllData clearAllData)
        {
            _seedData = seedData;
            _seedWarehouses = seedWarehouses;
            _seedBatches = seedBatches;
            _seedEnhancedProducts = seedEnhancedProducts;
            _seedWarehouseStocks = seedWarehouseStocks;
            _seedShops = seedShops;
            _clearAllData = clearAllData;
        }

        [HttpPost("all")]
        public async Task<IActionResult> SeedAll()
        {
            try
            {
                // Seed in order of dependencies
                await _seedEnhancedProducts.SeedAsync();
                await _seedWarehouses.SeedAsync();
                await _seedBatches.SeedAsync();
                await _seedData.SeedAllData();

                return Ok(new { message = "All data seeded successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("warehouses")]
        public async Task<IActionResult> SeedWarehouses()
        {
            try
            {
                await _seedWarehouses.SeedAsync();
                return Ok(new { message = "Warehouses seeded successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("batches")]
        public async Task<IActionResult> SeedBatches()
        {
            try
            {
                await _seedBatches.SeedAsync();
                return Ok(new { message = "Batches seeded successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("products")]
        public async Task<IActionResult> SeedProducts()
        {
            try
            {
                await _seedEnhancedProducts.SeedAsync();
                return Ok(new { message = "Products seeded successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


        [HttpPost("customers")]
        public async Task<IActionResult> SeedCustomers()
        {
            try
            {
                await _seedData.SeedAllData();
                return Ok(new { message = "Customers seeded successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("warehouse-stocks")]
        public async Task<IActionResult> SeedWarehouseStocks()
        {
            try
            {
                await _seedWarehouseStocks.SeedAsync();
                return Ok(new { message = "Warehouse stocks seeded successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("clear-warehouse-stocks")]
        public async Task<IActionResult> ClearWarehouseStocks()
        {
            try
            {
                await _seedWarehouseStocks.ClearAllAsync();
                return Ok(new { message = "Warehouse stocks cleared successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("clear")]
        public async Task<IActionResult> ClearAll()
        {
            try
            {
                await _clearAllData.ClearAllAsync();
                return Ok(new { message = "All data cleared successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("shops")]
        public async Task<IActionResult> SeedShops()
        {
            try
            {
                await _seedShops.SeedAsync();
                return Ok(new { message = "Shops seeded successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

    }
} 