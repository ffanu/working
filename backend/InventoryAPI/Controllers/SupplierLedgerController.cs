using Microsoft.AspNetCore.Mvc;
using InventoryAPI.Models;
using InventoryAPI.Services;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SupplierLedgerController : ControllerBase
    {
        private readonly SupplierLedgerService _supplierLedgerService;
        private readonly SupplierService _supplierService;
        private readonly DatabaseService _databaseService;

        public SupplierLedgerController(SupplierLedgerService supplierLedgerService, SupplierService supplierService, DatabaseService databaseService)
        {
            _supplierLedgerService = supplierLedgerService;
            _supplierService = supplierService;
            _databaseService = databaseService;
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetAll(
            [FromQuery] string? search = null,
            [FromQuery] string? sortBy = "createdAt",
            [FromQuery] string? sortDir = "desc",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var ledger = await _supplierLedgerService.GetAllAsync();
                return Ok(new { data = ledger, total = ledger.Count });
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
                var summary = await _supplierLedgerService.GetSupplierSummaryAsync();
                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("supplier/{supplierId}")]
        public async Task<ActionResult<object>> GetBySupplierId(string supplierId)
        {
            try
            {
                var supplier = await _supplierService.GetByIdAsync(supplierId);
                if (supplier == null)
                    return NotFound("Supplier not found");

                var ledger = await _supplierLedgerService.GetBySupplierIdAsync(supplierId);
                return Ok(new { data = ledger, total = ledger.Count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("supplier/{supplierId}/detailed")]
        public async Task<ActionResult<object>> GetDetailedLedgerBySupplier(
            string supplierId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var supplier = await _supplierService.GetByIdAsync(supplierId);
                if (supplier == null)
                    return NotFound("Supplier not found");

                var ledger = await _supplierLedgerService.GetDetailedLedgerBySupplierAsync(supplierId, startDate, endDate);
                return Ok(new { data = ledger, total = ledger.Count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("supplier/{supplierId}/summary")]
        public async Task<ActionResult<object>> GetSupplierLedgerSummary(string supplierId)
        {
            try
            {
                var summary = await _supplierLedgerService.GetSupplierLedgerSummaryAsync(supplierId);
                if (summary == null)
                    return NotFound("Supplier not found");

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("supplier/{supplierId}/balance")]
        public async Task<ActionResult<object>> GetCurrentBalance(string supplierId)
        {
            try
            {
                var supplier = await _supplierService.GetByIdAsync(supplierId);
                if (supplier == null)
                    return NotFound("Supplier not found");

                var balance = await _supplierLedgerService.GetCurrentBalanceAsync(supplierId);
                return Ok(new { supplierId, supplierName = supplier.Name, currentBalance = balance });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("supplier/{supplierId}/payment")]
        public async Task<ActionResult<SupplierLedger>> AddPayment(
            string supplierId,
            [FromBody] PaymentRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                await _supplierLedgerService.AddPaymentTransactionAsync(
                    supplierId,
                    request.Amount,
                    request.Reference,
                    request.Description,
                    request.CreatedBy ?? "System"
                );

                return Ok(new { message = "Payment recorded successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("date-range")]
        public async Task<ActionResult<object>> GetByDateRange(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var ledger = await _supplierLedgerService.GetByDateRangeAsync(startDate, endDate);
                return Ok(new { data = ledger, total = ledger.Count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("type/{transactionType}")]
        public async Task<ActionResult<object>> GetByType(string transactionType)
        {
            try
            {
                var ledger = await _supplierLedgerService.GetByTypeAsync(transactionType);
                return Ok(new { data = ledger, total = ledger.Count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("sync-existing-purchases")]
        public async Task<ActionResult<object>> SyncExistingPurchases()
        {
            try
            {
                // Get the purchases collection from the database service
                var purchasesCollection = _supplierLedgerService.GetPurchasesCollection(_databaseService);
                await _supplierLedgerService.SyncExistingPurchasesAsync(purchasesCollection);
                return Ok(new { message = "Existing purchases synced to supplier ledger successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("create-test-data")]
        public async Task<ActionResult<object>> CreateTestData()
        {
            try
            {
                // Create some test supplier ledger entries
                var testEntries = new List<SupplierLedger>
                {
                    new SupplierLedger
                    {
                        SupplierId = "6878e0d3f219b58444b64043", // Innovation Masters
                        SupplierName = "Innovation Masters",
                        TransactionId = Guid.NewGuid().ToString(),
                        TransactionType = "Purchase",
                        Amount = 1250.00m,
                        Reference = "Purchase #TEST-001",
                        Description = "Test purchase transaction",
                        TransactionDate = DateTime.UtcNow.AddDays(-1),
                        CreatedBy = "System"
                    },
                    new SupplierLedger
                    {
                        SupplierId = "6878e0d3f219b58444b64044", // Future Systems
                        SupplierName = "Future Systems",
                        TransactionId = Guid.NewGuid().ToString(),
                        TransactionType = "Purchase",
                        Amount = 890.00m,
                        Reference = "Purchase #TEST-002",
                        Description = "Test purchase transaction",
                        TransactionDate = DateTime.UtcNow.AddDays(-2),
                        CreatedBy = "System"
                    },
                    new SupplierLedger
                    {
                        SupplierId = "6878e0d3f219b58444b64043", // Innovation Masters
                        SupplierName = "Innovation Masters",
                        TransactionId = Guid.NewGuid().ToString(),
                        TransactionType = "Payment",
                        Amount = -800.00m,
                        Reference = "Payment #PAY-001",
                        Description = "Supplier payment",
                        TransactionDate = DateTime.UtcNow.AddHours(-6),
                        CreatedBy = "System"
                    }
                };

                foreach (var entry in testEntries)
                {
                    await _supplierLedgerService.CreateAsync(entry);
                }

                return Ok(new { message = "Test data created successfully", count = testEntries.Count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
} 