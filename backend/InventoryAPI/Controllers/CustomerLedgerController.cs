using Microsoft.AspNetCore.Mvc;
using InventoryAPI.Models;
using InventoryAPI.Services;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerLedgerController : ControllerBase
    {
        private readonly CustomerLedgerService _customerLedgerService;
        private readonly CustomerService _customerService;
        private readonly DatabaseService _databaseService;

        public CustomerLedgerController(CustomerLedgerService customerLedgerService, CustomerService customerService, DatabaseService databaseService)
        {
            _customerLedgerService = customerLedgerService;
            _customerService = customerService;
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
                var ledger = await _customerLedgerService.GetAllAsync();
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
                var summary = await _customerLedgerService.GetCustomerSummaryAsync();
                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<object>> GetByCustomerId(string customerId)
        {
            try
            {
                var customer = await _customerService.GetByIdAsync(customerId);
                if (customer == null)
                    return NotFound("Customer not found");

                var ledger = await _customerLedgerService.GetByCustomerIdAsync(customerId);
                return Ok(new { data = ledger, total = ledger.Count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("customer/{customerId}/detailed")]
        public async Task<ActionResult<object>> GetDetailedLedgerByCustomer(
            string customerId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var customer = await _customerService.GetByIdAsync(customerId);
                if (customer == null)
                    return NotFound("Customer not found");

                var ledger = await _customerLedgerService.GetDetailedLedgerByCustomerAsync(customerId, startDate, endDate);
                return Ok(new { data = ledger, total = ledger.Count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("customer/{customerId}/summary")]
        public async Task<ActionResult<object>> GetCustomerLedgerSummary(string customerId)
        {
            try
            {
                var summary = await _customerLedgerService.GetCustomerLedgerSummaryAsync(customerId);
                if (summary == null)
                    return NotFound("Customer not found");

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("customer/{customerId}/balance")]
        public async Task<ActionResult<object>> GetCurrentBalance(string customerId)
        {
            try
            {
                var customer = await _customerService.GetByIdAsync(customerId);
                if (customer == null)
                    return NotFound("Customer not found");

                var balance = await _customerLedgerService.GetCurrentBalanceAsync(customerId);
                return Ok(new { customerId, customerName = customer.Name, currentBalance = balance });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("customer/{customerId}/payment")]
        public async Task<ActionResult<CustomerLedger>> AddPayment(
            string customerId,
            [FromBody] PaymentRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                await _customerLedgerService.AddPaymentTransactionAsync(
                    customerId,
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
                var ledger = await _customerLedgerService.GetByDateRangeAsync(startDate, endDate);
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
                var ledger = await _customerLedgerService.GetByTypeAsync(transactionType);
                return Ok(new { data = ledger, total = ledger.Count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("test/create-entries")]
        public async Task<ActionResult<object>> CreateTestEntries()
        {
            try
            {
                // This is a test endpoint to manually create ledger entries
                // In production, this should be removed
                await _customerLedgerService.SyncExistingSalesAsync();
                return Ok(new { message = "Test entries created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("sync-existing-sales")]
        public async Task<ActionResult<object>> SyncExistingSales()
        {
            try
            {
                // Get the sales collection from the database service
                var salesCollection = _customerLedgerService.GetSalesCollection(_databaseService);
                await _customerLedgerService.SyncExistingSalesAsync(salesCollection);
                return Ok(new { message = "Existing sales synced to customer ledger successfully" });
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
                // Create some test customer ledger entries
                var testEntries = new List<CustomerLedger>
                {
                    new CustomerLedger
                    {
                        CustomerId = "6878e0d3f219b58444b64073", // Monica Cox
                        CustomerName = "Monica Cox",
                        TransactionId = Guid.NewGuid().ToString(),
                        TransactionType = "Sale",
                        Amount = 754.00m,
                        Reference = "Sale #TEST-001",
                        Description = "Test sale transaction",
                        TransactionDate = DateTime.UtcNow.AddDays(-1),
                        CreatedBy = "System"
                    },
                    new CustomerLedger
                    {
                        CustomerId = "6878e0d3f219b58444b64077", // Natalie Peterson
                        CustomerName = "Natalie Peterson",
                        TransactionId = Guid.NewGuid().ToString(),
                        TransactionType = "Sale",
                        Amount = 123.00m,
                        Reference = "Sale #TEST-002",
                        Description = "Test sale transaction",
                        TransactionDate = DateTime.UtcNow.AddDays(-2),
                        CreatedBy = "System"
                    },
                    new CustomerLedger
                    {
                        CustomerId = "6878e0d3f219b58444b64073", // Monica Cox
                        CustomerName = "Monica Cox",
                        TransactionId = Guid.NewGuid().ToString(),
                        TransactionType = "Payment",
                        Amount = -500.00m,
                        Reference = "Payment #PAY-001",
                        Description = "Customer payment",
                        TransactionDate = DateTime.UtcNow.AddHours(-6),
                        CreatedBy = "System"
                    }
                };

                foreach (var entry in testEntries)
                {
                    await _customerLedgerService.CreateAsync(entry);
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