using Microsoft.AspNetCore.Mvc;
using NetworkingApp.Data;
using NetworkingApp.Models;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace NetworkingApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FlightCompanionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<FlightCompanionController> _logger;

        public FlightCompanionController(
            ApplicationDbContext context, 
            IMapper mapper,
            ILogger<FlightCompanionController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // ✅ EXISTING - GET: api/flightcompanion/requests
        [HttpGet("requests")]
        public async Task<ActionResult<IEnumerable<FlightCompanionRequest>>> GetRequests()
        {
            try
            {
                // Temporarily remove .Include(r => r.User) to test
                var requests = await _context.FlightCompanionRequests
                    .Where(r => r.IsActive)
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();

                return Ok(requests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving flight companion requests");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ✅ EXISTING - GET: api/flightcompanion/requests/{id}
        [HttpGet("requests/{id}")]
        public async Task<ActionResult<FlightCompanionRequest>> GetRequest(int id)
        {
            var request = await _context.FlightCompanionRequests
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (request == null)
            {
                throw ApiException.NotFound("FlightCompanionRequest", id.ToString());
            }

            return Ok(request);
        }

        // ✅ EXISTING - POST: api/flightcompanion/requests
        [HttpPost("requests")]
        public async Task<ActionResult<FlightCompanionRequest>> CreateRequest(
            [FromBody] FlightCompanionRequest request)
        {
            try
            {
                // Business logic validation
                if (request.FlightDate <= DateTime.UtcNow)
                {
                    throw ApiException.BadRequest(
                        "Flight date must be in the future.", 
                        $"Provided date: {request.FlightDate}"
                    );
                }

                // Set default values
                request.CreatedAt = DateTime.UtcNow;
                request.IsActive = true;
                request.IsMatched = false;

                _context.FlightCompanionRequests.Add(request);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created flight companion request with ID {RequestId}", request.Id);

                return CreatedAtAction(
                    nameof(GetRequest), 
                    new { id = request.Id }, 
                    request
                );
            }
            catch (Exception ex) when (!(ex is ApiException))
            {
                _logger.LogError(ex, "Error creating flight companion request");
                throw; // Will be handled by middleware
            }
        }

        // 🆕 MISSING - GET: api/flightcompanion/offers
        [HttpGet("offers")]
        public async Task<ActionResult<IEnumerable<FlightCompanionOffer>>> GetOffers()
        {
            try
            {
                // Temporarily remove .Include(o => o.User) to test
                var offers = await _context.FlightCompanionOffers
                    .Where(o => o.IsAvailable)
                    .OrderByDescending(o => o.CreatedAt)
                    .ToListAsync();

                return Ok(offers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving flight companion offers");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // 🆕 MISSING - GET: api/flightcompanion/offers/{id}
        [HttpGet("offers/{id}")]
        public async Task<ActionResult<FlightCompanionOffer>> GetOffer(int id)
        {
            var offer = await _context.FlightCompanionOffers
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (offer == null)
            {
                throw ApiException.NotFound("FlightCompanionOffer", id.ToString());
            }

            return Ok(offer);
        }

        // 🆕 MISSING - POST: api/flightcompanion/offers
        [HttpPost("offers")]
        public async Task<ActionResult<FlightCompanionOffer>> CreateOffer(
            [FromBody] FlightCompanionOffer offer)
        {
            try
            {
                // Business logic validation
                if (offer.FlightDate <= DateTime.UtcNow)
                {
                    throw ApiException.BadRequest(
                        "Flight date must be in the future.", 
                        $"Provided date: {offer.FlightDate}"
                    );
                }

                if (offer.RequestedAmount < 0)
                {
                    throw ApiException.BadRequest(
                        "Requested amount cannot be negative.", 
                        $"Provided amount: {offer.RequestedAmount}"
                    );
                }

                // Set default values
                offer.CreatedAt = DateTime.UtcNow;
                offer.IsAvailable = true;
                offer.HelpedCount = 0;

                _context.FlightCompanionOffers.Add(offer);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created flight companion offer with ID {OfferId}", offer.Id);

                return CreatedAtAction(
                    nameof(GetOffer), 
                    new { id = offer.Id }, 
                    offer
                );
            }
            catch (Exception ex) when (!(ex is ApiException))
            {
                _logger.LogError(ex, "Error creating flight companion offer");
                throw; // Will be handled by middleware
            }
        }

        // 🆕 ADDITIONAL - GET: api/flightcompanion/match/{requestId}
        [HttpGet("match/{requestId}")]
        public async Task<ActionResult<IEnumerable<FlightCompanionOffer>>> FindMatches(int requestId)
        {
            if (requestId <= 0)
            {
                return BadRequest("Invalid request ID.");
            }

            var request = await _context.FlightCompanionRequests.FindAsync(requestId);
            if (request == null)
            {
                return NotFound($"Flight companion request with ID {requestId} not found.");
            }

            // Find matching flight companion offers
            var matches = await _context.FlightCompanionOffers
                .Include(o => o.User)
                .Where(o => o.IsAvailable &&
                           o.FlightNumber == request.FlightNumber &&
                           o.FlightDate.Date == request.FlightDate.Date &&
                           o.DepartureAirport == request.DepartureAirport &&
                           o.ArrivalAirport == request.ArrivalAirport)
                .OrderBy(o => o.RequestedAmount)
                .ToListAsync();

            return Ok(matches);
        }

        // TEMPORARY - GET: api/flightcompanion/test
        [HttpGet("test")]
        public async Task<ActionResult> TestEndpoint()
        {
            try
            {
                _logger.LogInformation("Testing database connection...");
                
                // Test 1: Basic database connection
                var canConnect = await _context.Database.CanConnectAsync();
                if (!canConnect)
                {
                    return StatusCode(500, new { error = "Cannot connect to database" });
                }

                // Test 2: Count total requests (without Include)
                var requestCount = await _context.FlightCompanionRequests.CountAsync();
                
                // Test 3: Count total users
                var userCount = await _context.Users.CountAsync();
                
                // Test 4: Check for orphaned records (requests without users)
                var requestsWithoutUsers = await _context.FlightCompanionRequests
                    .Where(r => !_context.Users.Any(u => u.Id == r.UserId))
                    .Select(r => new { r.Id, r.UserId, r.FlightNumber })
                    .ToListAsync();

                // Test 5: Check User IDs in requests vs actual Users
                var userIdsInRequests = await _context.FlightCompanionRequests
                    .Select(r => r.UserId)
                    .Distinct()
                    .ToListAsync();
                    
                var actualUserIds = await _context.Users
                    .Select(u => u.Id)
                    .ToListAsync();

                // Test 6: Try to load with Include (this should fail)
                Exception? includeException = null;
                var includeSuccessful = false;
                try
                {
                    var requestsWithUsers = await _context.FlightCompanionRequests
                        .Include(r => r.User)
                        .Take(1)
                        .ToListAsync();
                    includeSuccessful = true;
                }
                catch (Exception ex)
                {
                    includeException = ex;
                }

                // Test 7: Sample requests data
                var sampleRequests = await _context.FlightCompanionRequests
                    .Select(r => new { r.Id, r.FlightNumber, r.UserId, r.CreatedAt })
                    .Take(5)
                    .ToListAsync();

                return Ok(new
                {
                    message = "*** UPDATED DIAGNOSTIC TESTS COMPLETED ***",
                    canConnect,
                    requestCount,
                    userCount,
                    requestsWithoutUsers,
                    userIdsInRequests,
                    actualUserIds,
                    includeSuccessful,
                    includeError = includeException?.Message,
                    includeStackTrace = includeException?.StackTrace,
                    sampleRequests
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Test endpoint failed");
                return StatusCode(500, new 
                { 
                    error = ex.Message,
                    stackTrace = ex.StackTrace,
                    innerException = ex.InnerException?.Message
                });
            }
        }
    }
}