using Microsoft.AspNetCore.Mvc;
using InventoryAPI.Services;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StockInitializationController : ControllerBase
    {
        private readonly StockInitializationService _stockService;

        public StockInitializationController(StockInitializationService stockService)
        {
            _stockService = stockService;
        }

        [HttpPost("warehouse-stocks")]
        public async Task<IActionResult> InitializeWarehouseStocks()
        {
            try
            {
                await _stockService.InitializeWarehouseStocksAsync();
                return Ok(new { message = "Warehouse stocks initialized successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("shop-stocks")]
        public async Task<IActionResult> InitializeShopStocks()
        {
            try
            {
                await _stockService.InitializeShopStocksAsync();
                return Ok(new { message = "Shop stocks initialized successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("all-stocks")]
        public async Task<IActionResult> InitializeAllStocks()
        {
            try
            {
                await _stockService.InitializeWarehouseStocksAsync();
                await _stockService.InitializeShopStocksAsync();
                return Ok(new { message = "All stocks initialized successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("purchase/{productId}/{warehouseId}/{quantity}/{unitCost}")]
        public async Task<IActionResult> UpdateStockOnPurchase(
            string productId, 
            string warehouseId, 
            int quantity, 
            decimal unitCost)
        {
            try
            {
                await _stockService.UpdateStockOnPurchaseAsync(productId, warehouseId, quantity, unitCost);
                return Ok(new { message = "Stock updated on purchase" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("transfer/{productId}/{fromWarehouseId}/{toShopId}/{quantity}")]
        public async Task<IActionResult> TransferStock(
            string productId, 
            string fromWarehouseId, 
            string toShopId, 
            int quantity)
        {
            try
            {
                await _stockService.TransferStockAsync(productId, fromWarehouseId, toShopId, quantity);
                return Ok(new { message = "Stock transferred successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("sale/{productId}/{shopId}/{quantity}")]
        public async Task<IActionResult> UpdateStockOnSale(
            string productId, 
            string shopId, 
            int quantity)
        {
            try
            {
                await _stockService.UpdateStockOnSaleAsync(productId, shopId, quantity);
                return Ok(new { message = "Stock updated on sale" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("summary/{locationId}")]
        public async Task<ActionResult<object>> GetStockSummary(string locationId, [FromQuery] bool isWarehouse = true)
        {
            try
            {
                var summary = await _stockService.GetStockSummaryAsync(locationId, isWarehouse);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
