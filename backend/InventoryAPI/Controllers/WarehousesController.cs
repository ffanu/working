using Microsoft.AspNetCore.Mvc;
using InventoryAPI.Models;
using InventoryAPI.Services;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WarehousesController : ControllerBase
    {
        private readonly WarehouseService _warehouseService;

        public WarehousesController(WarehouseService warehouseService)
        {
            _warehouseService = warehouseService;
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetAll(
            [FromQuery] string? search = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] string? sortDir = "asc",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var result = await _warehouseService.GetPagedAsync(search, sortBy, sortDir, page, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Warehouse>> GetById(string id)
        {
            try
            {
                var warehouse = await _warehouseService.GetByIdAsync(id);
                if (warehouse == null)
                    return NotFound();

                return Ok(warehouse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("default")]
        public async Task<ActionResult<Warehouse>> GetDefault()
        {
            try
            {
                var warehouse = await _warehouseService.GetDefaultAsync();
                if (warehouse == null)
                    return NotFound();

                return Ok(warehouse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("active")]
        public async Task<ActionResult<List<Warehouse>>> GetActive()
        {
            try
            {
                var warehouses = await _warehouseService.GetActiveAsync();
                return Ok(warehouses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Warehouse>> Create(Warehouse warehouse)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(new { message = "Validation failed", errors = errors });
                }

                var createdWarehouse = await _warehouseService.CreateAsync(warehouse);
                return CreatedAtAction(nameof(GetById), new { id = createdWarehouse.Id }, createdWarehouse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Warehouse warehouse)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                warehouse.Id = id;
                var success = await _warehouseService.UpdateAsync(id, warehouse);
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
                var success = await _warehouseService.DeleteAsync(id);
                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPatch("{id}/set-default")]
        public async Task<IActionResult> SetDefault(string id)
        {
            try
            {
                var success = await _warehouseService.SetDefaultAsync(id);
                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("shop/{shopId}")]
        public async Task<ActionResult<List<Warehouse>>> GetByShopId(string shopId)
        {
            try
            {
                var warehouses = await _warehouseService.GetActiveByShopIdAsync(shopId);
                return Ok(warehouses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}


