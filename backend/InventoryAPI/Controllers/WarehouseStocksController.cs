using Microsoft.AspNetCore.Mvc;
using InventoryAPI.Models;
using InventoryAPI.Services;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WarehouseStocksController : ControllerBase
    {
        private readonly WarehouseStockService _warehouseStockService;

        public WarehouseStocksController(WarehouseStockService warehouseStockService)
        {
            _warehouseStockService = warehouseStockService;
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetAll(
            [FromQuery] string? search = null,
            [FromQuery] string? warehouseId = null,
            [FromQuery] string? productId = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] string? sortDir = "asc",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var result = await _warehouseStockService.GetPagedAsync(search, warehouseId, productId, sortBy, sortDir, page, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("all")]
        public async Task<ActionResult<List<WarehouseStock>>> GetAllSimple()
        {
            try
            {
                var warehouseStocks = await _warehouseStockService.GetAllAsync();
                return Ok(warehouseStocks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // NEW: Warehouse-wise stock endpoints (must come before {id} route)
        [HttpGet("warehouse-wise")]
        public async Task<ActionResult<object>> GetWarehouseWiseStocks(
            [FromQuery] string? search = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] string? sortDir = "asc",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var result = await _warehouseStockService.GetWarehouseWiseStocksAsync(search, sortBy, sortDir, page, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("warehouse-wise/summary")]
        public async Task<ActionResult<object>> GetWarehouseWiseSummary()
        {
            try
            {
                var summary = await _warehouseStockService.GetWarehouseWiseSummaryAsync();
                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // NEW: Shop-wise stock endpoints (must come before {id} route)
        [HttpGet("shop-wise")]
        public async Task<ActionResult<object>> GetShopWiseStocks(
            [FromQuery] string? search = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] string? sortDir = "asc",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var result = await _warehouseStockService.GetShopWiseStocksAsync(search, sortBy, sortDir, page, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("shop-wise/summary")]
        public async Task<ActionResult<object>> GetShopWiseSummary()
        {
            try
            {
                var summary = await _warehouseStockService.GetShopWiseSummaryAsync();
                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<WarehouseStock>> GetById(string id)
        {
            try
            {
                var warehouseStock = await _warehouseStockService.GetByIdAsync(id);
                if (warehouseStock == null)
                    return NotFound();

                return Ok(warehouseStock);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("warehouse/{warehouseId}")]
        public async Task<ActionResult<List<WarehouseStock>>> GetByWarehouse(string warehouseId)
        {
            try
            {
                var warehouseStocks = await _warehouseStockService.GetByWarehouseAsync(warehouseId);
                return Ok(warehouseStocks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("product/{productId}")]
        public async Task<ActionResult<List<WarehouseStock>>> GetByProduct(string productId)
        {
            try
            {
                var warehouseStocks = await _warehouseStockService.GetByProductAsync(productId);
                return Ok(warehouseStocks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("low-stock")]
        public async Task<ActionResult<List<WarehouseStock>>> GetLowStock([FromQuery] int threshold = 5)
        {
            try
            {
                var lowStockItems = await _warehouseStockService.GetLowStockAsync(threshold);
                return Ok(lowStockItems);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("out-of-stock")]
        public async Task<ActionResult<List<WarehouseStock>>> GetOutOfStock()
        {
            try
            {
                var outOfStockItems = await _warehouseStockService.GetOutOfStockAsync();
                return Ok(outOfStockItems);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<WarehouseStock>> Create(WarehouseStock warehouseStock)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var createdWarehouseStock = await _warehouseStockService.CreateAsync(warehouseStock);
                return CreatedAtAction(nameof(GetById), new { id = createdWarehouseStock.Id }, createdWarehouseStock);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, WarehouseStock warehouseStock)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var success = await _warehouseStockService.UpdateAsync(id, warehouseStock);
                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var success = await _warehouseStockService.DeleteAsync(id);
                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{id}/adjust")]
        public async Task<IActionResult> AdjustQuantity(string id, [FromBody] QuantityAdjustmentRequest request)
        {
            try
            {
                var success = await _warehouseStockService.AdjustQuantityAsync(id, request.Quantity);
                if (!success)
                    return BadRequest("Failed to adjust quantity. Check if sufficient stock is available.");

                return Ok(new { message = "Quantity adjusted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("summary")]
        public async Task<ActionResult<object>> GetSummary()
        {
            try
            {
                var summary = await _warehouseStockService.GetSummaryAsync();
                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // NEW: Enhanced warehouse-sale relationship endpoints
        [HttpGet("available/{productId}")]
        public async Task<ActionResult<List<WarehouseStock>>> GetAvailableStock(string productId, [FromQuery] int requiredQuantity = 1)
        {
            try
            {
                var availableStock = await _warehouseStockService.GetAvailableStockAsync(productId, requiredQuantity);
                return Ok(availableStock);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("allocate")]
        public async Task<ActionResult<StockAllocationResult>> AllocateStock([FromBody] StockAllocationRequest request)
        {
            try
            {
                var result = await _warehouseStockService.AllocateStockAsync(
                    request.ProductId, 
                    request.Quantity, 
                    request.PreferredWarehouseId);
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

    }

    // Supporting classes
    public class QuantityAdjustmentRequest
    {
        public int Quantity { get; set; }
    }

    public class StockAllocationRequest
    {
        public string ProductId { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string? PreferredWarehouseId { get; set; }
    }
}