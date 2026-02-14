using Microsoft.AspNetCore.Mvc;
using InventoryAPI.Models;
using InventoryAPI.Services;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CashRegistersController : ControllerBase
    {
        private readonly CashRegisterService _cashRegisterService;

        public CashRegistersController(CashRegisterService cashRegisterService)
        {
            _cashRegisterService = cashRegisterService;
        }

        [HttpGet]
        public async Task<ActionResult<List<CashRegister>>> GetAll()
        {
            try
            {
                var registers = await _cashRegisterService.GetAllAsync();
                return Ok(registers);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CashRegister>> GetById(string id)
        {
            try
            {
                var register = await _cashRegisterService.GetByIdAsync(id);
                if (register == null)
                    return NotFound(new { error = "Cash register not found" });

                return Ok(register);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<CashRegister>> GetByUser(string userId)
        {
            try
            {
                var register = await _cashRegisterService.GetOpenRegisterAsync(userId);
                if (register == null)
                    return NotFound(new { error = "No open shift found for user" });

                return Ok(register);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("open-shift")]
        public async Task<ActionResult<CashRegister>> OpenShift([FromBody] OpenShiftRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var register = await _cashRegisterService.OpenShiftAsync(
                    request.RegisterName,
                    request.Location,
                    request.UserId,
                    request.UserName,
                    request.OpeningCash);

                return CreatedAtAction(nameof(GetById), new { id = register.Id }, register);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPatch("{id}/close-shift")]
        public async Task<ActionResult> CloseShift(string id, [FromBody] CloseShiftRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var success = await _cashRegisterService.CloseShiftAsync(
                    id, request.UserId, request.ClosingCash, request.Notes);

                if (!success)
                    return BadRequest(new { error = "Cannot close shift" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPatch("{id}/suspend-shift")]
        public async Task<ActionResult> SuspendShift(string id, [FromBody] SuspendShiftRequest request)
        {
            try
            {
                var success = await _cashRegisterService.SuspendShiftAsync(id, request.UserId);
                if (!success)
                    return BadRequest(new { error = "Cannot suspend shift" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPatch("{id}/resume-shift")]
        public async Task<ActionResult> ResumeShift(string id, [FromBody] ResumeShiftRequest request)
        {
            try
            {
                var success = await _cashRegisterService.ResumeShiftAsync(id, request.UserId);
                if (!success)
                    return BadRequest(new { error = "Cannot resume shift" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{id}/cash-in")]
        public async Task<ActionResult<CashTransaction>> CashIn(string id, [FromBody] CashInRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var transaction = await _cashRegisterService.CashInAsync(
                    id, request.Amount, request.Description, request.UserId, request.UserName, request.Notes);

                return Ok(transaction);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{id}/cash-out")]
        public async Task<ActionResult<CashTransaction>> CashOut(string id, [FromBody] CashOutRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var transaction = await _cashRegisterService.CashOutAsync(
                    id, request.Amount, request.Description, request.UserId, request.UserName, request.Notes);

                return Ok(transaction);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("{id}/transactions")]
        public async Task<ActionResult<List<CashTransaction>>> GetTransactions(
            string id,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            try
            {
                var transactions = await _cashRegisterService.GetTransactionsAsync(id, startDate, endDate);
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("{id}/shift-summary")]
        public async Task<ActionResult<ShiftSummary>> GetShiftSummary(string id)
        {
            try
            {
                var summary = await _cashRegisterService.GetShiftSummaryAsync(id);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("daily-summary")]
        public async Task<ActionResult<object>> GetDailySummary([FromQuery] DateTime date)
        {
            try
            {
                var summary = await _cashRegisterService.GetDailySummaryAsync(date);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }

    public class OpenShiftRequest
    {
        public string RegisterName { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public decimal OpeningCash { get; set; } = 0;
    }

    public class CloseShiftRequest
    {
        public string UserId { get; set; } = string.Empty;
        public decimal ClosingCash { get; set; } = 0;
        public string Notes { get; set; } = string.Empty;
    }

    public class SuspendShiftRequest
    {
        public string UserId { get; set; } = string.Empty;
    }

    public class ResumeShiftRequest
    {
        public string UserId { get; set; } = string.Empty;
    }

    public class CashInRequest
    {
        public decimal Amount { get; set; } = 0;
        public string Description { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
    }

    public class CashOutRequest
    {
        public decimal Amount { get; set; } = 0;
        public string Description { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
    }
}


