using Microsoft.AspNetCore.Mvc;
using InventoryAPI.Models;
using InventoryAPI.Services;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RefundsController : ControllerBase
    {
        private readonly RefundService _refundService;

        public RefundsController(RefundService refundService)
        {
            _refundService = refundService;
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetAll(
            [FromQuery] string? search,
            [FromQuery] RefundStatus? status,
            [FromQuery] string? customerId,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] string? sortBy,
            [FromQuery] string? sortDir,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var result = await _refundService.GetPagedAsync(
                    search, status, customerId, startDate, endDate, 
                    sortBy, sortDir, page, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("all")]
        public async Task<ActionResult<List<Refund>>> GetAllRefunds()
        {
            try
            {
                var refunds = await _refundService.GetAllAsync();
                return Ok(refunds);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Refund>> GetById(string id)
        {
            try
            {
                var refund = await _refundService.GetByIdAsync(id);
                if (refund == null)
                    return NotFound(new { error = "Refund not found" });

                return Ok(refund);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<List<Refund>>> GetByCustomer(string customerId)
        {
            try
            {
                var refunds = await _refundService.GetByCustomerAsync(customerId);
                return Ok(refunds);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("status/{status}")]
        public async Task<ActionResult<List<Refund>>> GetByStatus(RefundStatus status)
        {
            try
            {
                var refunds = await _refundService.GetByStatusAsync(status);
                return Ok(refunds);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<Refund>> Create(Refund refund)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var createdRefund = await _refundService.CreateAsync(refund);
                return CreatedAtAction(nameof(GetById), new { id = createdRefund.Id }, createdRefund);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, Refund refund)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var success = await _refundService.UpdateAsync(id, refund);
                if (!success)
                    return NotFound(new { error = "Refund not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPatch("{id}/approve")]
        public async Task<ActionResult> Approve(string id, [FromBody] ApproveRefundRequest request)
        {
            try
            {
                var success = await _refundService.ApproveAsync(id, request.ApprovedBy);
                if (!success)
                    return NotFound(new { error = "Refund not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPatch("{id}/reject")]
        public async Task<ActionResult> Reject(string id, [FromBody] RejectRefundRequest request)
        {
            try
            {
                var success = await _refundService.RejectAsync(id, request.RejectedBy, request.Reason);
                if (!success)
                    return NotFound(new { error = "Refund not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPatch("{id}/process")]
        public async Task<ActionResult> Process(string id, [FromBody] ProcessRefundRequest request)
        {
            try
            {
                var success = await _refundService.ProcessAsync(id, request.ProcessedBy);
                if (!success)
                    return BadRequest(new { error = "Refund cannot be processed" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPatch("{id}/cancel")]
        public async Task<ActionResult> Cancel(string id)
        {
            try
            {
                var success = await _refundService.CancelAsync(id);
                if (!success)
                    return NotFound(new { error = "Refund not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            try
            {
                var success = await _refundService.DeleteAsync(id);
                if (!success)
                    return NotFound(new { error = "Refund not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetStats()
        {
            try
            {
                var stats = await _refundService.GetRefundStatsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }

    public class ApproveRefundRequest
    {
        public string ApprovedBy { get; set; } = string.Empty;
    }

    public class RejectRefundRequest
    {
        public string RejectedBy { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
    }

    public class ProcessRefundRequest
    {
        public string ProcessedBy { get; set; } = string.Empty;
    }
}


