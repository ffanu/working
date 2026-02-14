using Microsoft.AspNetCore.Mvc;
using InventoryAPI.Models;
using InventoryAPI.Services;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BatchesController : ControllerBase
    {
        private readonly BatchService _batchService;

        public BatchesController(BatchService batchService)
        {
            _batchService = batchService;
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
                var result = await _batchService.GetPagedAsync(search, sortBy, sortDir, page, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Batch>> GetById(string id)
        {
            try
            {
                var batch = await _batchService.GetByIdAsync(id);
                if (batch == null)
                    return NotFound();

                return Ok(batch);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("product/{productId}")]
        public async Task<ActionResult<List<Batch>>> GetByProduct(string productId)
        {
            try
            {
                var batches = await _batchService.GetByProductIdAsync(productId);
                return Ok(batches);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("expiring-soon")]
        public async Task<ActionResult<List<Batch>>> GetExpiringSoon([FromQuery] int days = 30)
        {
            try
            {
                var batches = await _batchService.GetExpiringSoonAsync(days);
                return Ok(batches);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("expired")]
        public async Task<ActionResult<List<Batch>>> GetExpired()
        {
            try
            {
                var batches = await _batchService.GetExpiredAsync();
                return Ok(batches);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("low-stock")]
        public async Task<ActionResult<List<Batch>>> GetLowStock([FromQuery] int threshold = 5)
        {
            try
            {
                var batches = await _batchService.GetLowStockAsync(threshold);
                return Ok(batches);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Batch>> Create(Batch batch)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var createdBatch = await _batchService.CreateAsync(batch);
                return CreatedAtAction(nameof(GetById), new { id = createdBatch.Id }, createdBatch);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Batch batch)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                batch.Id = id;
                var success = await _batchService.UpdateAsync(id, batch);
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
                var success = await _batchService.DeleteAsync(id);
                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPatch("{id}/quantity")]
        public async Task<IActionResult> UpdateQuantity(string id, [FromBody] int quantityChange)
        {
            try
            {
                var success = await _batchService.UpdateQuantityAsync(id, quantityChange);
                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}


