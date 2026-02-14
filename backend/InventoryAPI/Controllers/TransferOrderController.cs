using Microsoft.AspNetCore.Mvc;
using InventoryAPI.Services;
using InventoryAPI.Models;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/transfer-orders")]
    public class TransferOrderController : ControllerBase
    {
        private readonly TransferOrderService _transferOrderService;

        public TransferOrderController(TransferOrderService transferOrderService)
        {
            _transferOrderService = transferOrderService;
        }

        [HttpGet]
        public async Task<ActionResult<List<TransferOrder>>> GetAll()
        {
            var transferOrders = await _transferOrderService.GetAllAsync();
            return Ok(transferOrders);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TransferOrder>> GetById(string id)
        {
            var transferOrder = await _transferOrderService.GetByIdAsync(id);
            if (transferOrder == null)
                return NotFound();

            return Ok(transferOrder);
        }

        [HttpGet("status/{status}")]
        public async Task<ActionResult<List<TransferOrder>>> GetByStatus(string status)
        {
            var transferOrders = await _transferOrderService.GetByStatusAsync(status);
            return Ok(transferOrders);
        }

        [HttpGet("location/{locationId}")]
        public async Task<ActionResult<List<TransferOrder>>> GetByLocation(string locationId, [FromQuery] bool isFromLocation = true)
        {
            var transferOrders = await _transferOrderService.GetByLocationAsync(locationId, isFromLocation);
            return Ok(transferOrders);
        }

        [HttpPost]
        public async Task<ActionResult<TransferOrder>> Create(TransferOrder transferOrder)
        {
            try
            {
                Console.WriteLine($"Creating transfer order: {transferOrder?.TransferNumber}");
                var createdTransferOrder = await _transferOrderService.CreateAsync(transferOrder);
                Console.WriteLine($"Created transfer order with ID: {createdTransferOrder?.Id}");
                return CreatedAtAction(nameof(GetById), new { id = createdTransferOrder.Id }, createdTransferOrder);
            }
            catch (ArgumentException ex)
            {
                Console.WriteLine($"ArgumentException: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"InvalidOperationException: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"General Exception: {ex.Message}");
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, TransferOrder transferOrder)
        {
            var result = await _transferOrderService.UpdateAsync(id, transferOrder);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var result = await _transferOrderService.DeleteAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpPost("{id}/approve")]
        public async Task<IActionResult> Approve(string id, [FromBody] string approvedBy)
        {
            var result = await _transferOrderService.ApproveAsync(id, approvedBy);
            if (!result)
                return BadRequest("Transfer order not found or not in pending status");

            return Ok();
        }

        [HttpPost("{id}/complete")]
        public async Task<IActionResult> Complete(string id)
        {
            var result = await _transferOrderService.CompleteAsync(id);
            if (!result)
                return BadRequest("Transfer order not found or not in progress status");

            return Ok();
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> Cancel(string id)
        {
            var result = await _transferOrderService.CancelAsync(id);
            if (!result)
                return BadRequest("Transfer order not found or already completed");

            return Ok();
        }

        [HttpGet("summary")]
        public async Task<ActionResult<object>> GetSummary()
        {
            var summary = await _transferOrderService.GetSummaryAsync();
            return Ok(summary);
        }

        [HttpGet("pending")]
        public async Task<ActionResult<List<TransferOrder>>> GetPending()
        {
            var pendingOrders = await _transferOrderService.GetPendingTransfersAsync();
            return Ok(pendingOrders);
        }

        [HttpGet("overdue")]
        public async Task<ActionResult<List<TransferOrder>>> GetOverdue()
        {
            var overdueOrders = await _transferOrderService.GetOverdueTransfersAsync();
            return Ok(overdueOrders);
        }
    }
}
