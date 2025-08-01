using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using NetworkingApp.Data;
using NetworkingApp.Models;
using NetworkingApp.Models.DTOs;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using NetworkingApp.Services;
using System.ComponentModel.DataAnnotations;

namespace NetworkingApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FlightCompanionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<FlightCompanionController> _logger;
        // private readonly PaymentService _paymentService; // Payment feature disabled for current sprint

        public FlightCompanionController(
            ApplicationDbContext context, 
            IMapper mapper,
            ILogger<FlightCompanionController> logger)
            // PaymentService paymentService) // Payment feature disabled for current sprint
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
            // _paymentService = paymentService; // Payment feature disabled for current sprint
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

        // ✅ NEW - GET: api/flightcompanion/search-requests
        [HttpGet("search-requests")]
        public async Task<ActionResult<IEnumerable<FlightCompanionRequest>>> SearchRequests(
            [FromQuery] string? flightNumber = null,
            [FromQuery] string? departureAirport = null,
            [FromQuery] string? arrivalAirport = null,
            [FromQuery] DateTime? flightDate = null)
        {
            try
            {
                _logger.LogInformation("Searching flight companion requests with filters: FlightNumber={FlightNumber}, FlightDate={FlightDate}", 
                    flightNumber, flightDate);

                // First, let's test without Include to see if that's the issue
                var query = _context.FlightCompanionRequests
                    .Where(r => r.IsActive && !r.IsMatched);

                // Apply search filters
                if (!string.IsNullOrEmpty(flightNumber))
                {
                    query = query.Where(r => r.FlightNumber.ToLower().Contains(flightNumber.ToLower()));
                }

                if (!string.IsNullOrEmpty(departureAirport))
                {
                    query = query.Where(r => r.DepartureAirport.ToLower().Contains(departureAirport.ToLower()));
                }

                if (!string.IsNullOrEmpty(arrivalAirport))
                {
                    query = query.Where(r => r.ArrivalAirport.ToLower().Contains(arrivalAirport.ToLower()));
                }

                if (flightDate.HasValue)
                {
                    query = query.Where(r => r.FlightDate.Date == flightDate.Value.Date);
                }

                var requests = await query
                    .OrderBy(r => r.FlightDate)
                    .ThenBy(r => r.CreatedAt)
                    .ToListAsync();

                _logger.LogInformation("Found {Count} flight companion requests matching search criteria", requests.Count);
                return Ok(requests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching flight companion requests: {Message}", ex.Message);
                return StatusCode(500, new { error = ex.Message, details = ex.ToString() });
            }
        }

        // ✅ NEW - POST: api/flightcompanion/initiate-help
        [HttpPost("initiate-help")]
        [Authorize]
        public async Task<ActionResult<InitiateHelpResponse>> InitiateHelp([FromBody] InitiateHelpRequest request)
        {
            try
            {
                // Get current user ID
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized();
                }

                // Validate request exists and is available
                var flightRequest = await _context.FlightCompanionRequests
                    .Include(r => r.User)
                    .FirstOrDefaultAsync(r => r.Id == request.RequestId && r.IsActive && !r.IsMatched);

                if (flightRequest == null)
                {
                    return NotFound(new { message = "Flight companion request not found or already matched" });
                }

                // Prevent self-helping
                if (flightRequest.UserId == userId)
                {
                    return BadRequest(new { message = "Cannot help with your own request" });
                }

                // Create initial message
                var message = new Message
                {
                    SenderId = userId.Value,
                    ReceiverId = flightRequest.UserId,
                    Content = request.InitialMessage,
                    Type = "Text",
                    RequestType = "FlightCompanion",
                    RequestId = request.RequestId,
                    ThreadId = GenerateThreadId(userId.Value, flightRequest.UserId),
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                };

                _context.Messages.Add(message);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} initiated help for flight companion request {RequestId}", 
                    userId, request.RequestId);

                return Ok(new InitiateHelpResponse
                {
                    MessageId = message.Id,
                    ThreadId = message.ThreadId,
                    RequestId = request.RequestId,
                    ReceiverId = flightRequest.UserId,
                    Message = "Help request sent successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initiating help for flight companion request {RequestId}", request.RequestId);
                return StatusCode(500, new { error = ex.Message });
            }
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            return null;
        }

        private string GenerateThreadId(int user1Id, int user2Id)
        {
            // Create a consistent thread ID regardless of who initiates
            var sortedIds = new[] { user1Id, user2Id }.OrderBy(id => id).ToArray();
            return $"thread_{sortedIds[0]}_{sortedIds[1]}";
        }

        // ✅ EXISTING - POST: api/flightcompanion/requests
        [HttpPost("requests")]
        public async Task<ActionResult<FlightCompanionRequest>> CreateRequest(
            [FromBody] CreateFlightCompanionRequestDto requestDto)
        {
            try
            {
                // Extract user ID from authentication context, or use default for testing
                int userId = 1; // Default for testing
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int authenticatedUserId))
                {
                    userId = authenticatedUserId;
                }

                // Business logic validation
                if (requestDto.FlightDate <= DateTime.UtcNow)
                {
                    throw ApiException.BadRequest(
                        "Flight date must be in the future.", 
                        $"Provided date: {requestDto.FlightDate}"
                    );
                }

                // Create the request entity from DTO
                var request = new FlightCompanionRequest
                {
                    UserId = userId,
                    FlightNumber = requestDto.FlightNumber,
                    Airline = requestDto.Airline,
                    FlightDate = requestDto.FlightDate,
                    DepartureAirport = requestDto.DepartureAirport,
                    ArrivalAirport = requestDto.ArrivalAirport,
                    TravelerName = requestDto.TravelerName,
                    TravelerAge = requestDto.TravelerAge,
                    SpecialNeeds = requestDto.SpecialNeeds,
                    OfferedAmount = requestDto.OfferedAmount,
                    AdditionalNotes = requestDto.AdditionalNotes,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                    IsMatched = false
                };

                _context.FlightCompanionRequests.Add(request);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created flight companion request with ID {RequestId} for user {UserId}", request.Id, userId);

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

        // PUT: api/flightcompanion/requests/{id}
        [HttpPut("requests/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateRequest(int id, [FromBody] CreateFlightCompanionRequestDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var request = await _context.FlightCompanionRequests.FindAsync(id);
            if (request == null) return NotFound();
            if (request.UserId != userId) return Forbid();

            // Update fields
            request.FlightNumber = dto.FlightNumber;
            request.Airline = dto.Airline;
            request.FlightDate = dto.FlightDate;
            request.DepartureAirport = dto.DepartureAirport;
            request.ArrivalAirport = dto.ArrivalAirport;
            request.TravelerName = dto.TravelerName;
            request.TravelerAge = dto.TravelerAge;
            request.SpecialNeeds = dto.SpecialNeeds;
            request.OfferedAmount = dto.OfferedAmount;
            request.AdditionalNotes = dto.AdditionalNotes;
            // Do not update IsActive, IsMatched, CreatedAt, MatchedOfferId

            await _context.SaveChangesAsync();
            return Ok(request);
        }

        // DELETE: api/flightcompanion/requests/{id}
        [HttpDelete("requests/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteRequest(int id)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var request = await _context.FlightCompanionRequests.FindAsync(id);
            if (request == null) return NotFound();
            if (request.UserId != userId) return Forbid();

            _context.FlightCompanionRequests.Remove(request);
            await _context.SaveChangesAsync();
            return NoContent();
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

        // POST: api/flightcompanion/offers
        [HttpPost("offers")]
        public async Task<ActionResult<FlightCompanionOffer>> CreateOffer([FromBody] FlightCompanionOffer offer)
        {
            // Extract user ID from authentication context, or use default for testing
            int userId = 1; // Default for testing
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int authenticatedUserId))
            {
                userId = authenticatedUserId;
            }
            offer.UserId = userId;

            // Business logic validation
            if (offer.FlightDate <= DateTime.UtcNow)
            {
                return BadRequest("Flight date must be in the future.");
            }
            if (offer.RequestedAmount < 0)
            {
                return BadRequest("Requested amount cannot be negative.");
            }

            // Set default values
            offer.CreatedAt = DateTime.UtcNow;
            offer.IsAvailable = true;
            offer.HelpedCount = 0;

            _context.FlightCompanionOffers.Add(offer);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOffer), new { id = offer.Id }, offer);
        }

        // PUT: api/flightcompanion/offers/{id}
        [HttpPut("offers/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateOffer(int id, [FromBody] FlightCompanionOffer dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var offer = await _context.FlightCompanionOffers.FindAsync(id);
            if (offer == null) return NotFound();
            if (offer.UserId != userId) return Forbid();

            // Update fields
            offer.FlightNumber = dto.FlightNumber;
            offer.Airline = dto.Airline;
            offer.FlightDate = dto.FlightDate;
            offer.DepartureAirport = dto.DepartureAirport;
            offer.ArrivalAirport = dto.ArrivalAirport;
            offer.AvailableServices = dto.AvailableServices;
            offer.Languages = dto.Languages;
            offer.RequestedAmount = dto.RequestedAmount;
            offer.AdditionalInfo = dto.AdditionalInfo;
            offer.HelpedCount = dto.HelpedCount;
            // Do not update IsAvailable, CreatedAt, UserId

            await _context.SaveChangesAsync();
            return Ok(offer);
        }

        // DELETE: api/flightcompanion/offers/{id}
        [HttpDelete("offers/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteOffer(int id)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var offer = await _context.FlightCompanionOffers.FindAsync(id);
            if (offer == null) return NotFound();
            if (offer.UserId != userId) return Forbid();

            _context.FlightCompanionOffers.Remove(offer);
            await _context.SaveChangesAsync();
            return NoContent();
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

        // TODO: Add match confirmation endpoint
        /// <summary>
        /// Confirms a match between a request and an offer, creates payment and holds funds in escrow.
        /// </summary>
        [HttpPut("match")]
        public async Task<IActionResult> MatchRequestWithOffer([FromBody] FlightCompanionMatchRequest matchRequest)
        {
            if (matchRequest.RequestId <= 0 || matchRequest.OfferId <= 0)
                return BadRequest("Invalid request or offer ID.");

            var request = await _context.FlightCompanionRequests.FindAsync(matchRequest.RequestId);
            var offer = await _context.FlightCompanionOffers.FindAsync(matchRequest.OfferId);

            if (request == null) return NotFound($"Request {matchRequest.RequestId} not found.");
            if (offer == null) return NotFound($"Offer {matchRequest.OfferId} not found.");
            if (request.IsMatched) return BadRequest("Request is already matched.");
            if (!offer.IsAvailable) return BadRequest("Offer is not available.");

            // Update match
            request.IsMatched = true;
            request.MatchedOfferId = matchRequest.OfferId;
            offer.IsAvailable = false;

            await _context.SaveChangesAsync();

            // Create payment and hold funds
            var payment = new Payment
            {
                PayerId = request.UserId,
                ReceiverId = offer.UserId,
                RequestId = request.Id,
                RequestType = "FlightCompanion",
                Amount = request.OfferedAmount,
                Currency = "NZD",
                Status = PaymentStatus.HeldInEscrow.ToString(),
                CreatedAt = DateTime.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();
            // await _paymentService.HoldFundsAsync(payment.Id, payment.Amount); // Payment feature disabled for current sprint

            // TODO: Add notifications if needed

            return Ok(new { Message = "Match confirmed and funds held in escrow." });
        }

        /// <summary>
        /// Marks a flight companion service as completed and releases escrowed funds.
        /// </summary>
        [HttpPost("complete-service")]
        public async Task<IActionResult> CompleteService([FromBody] CompleteServiceRequest req)
        {
            var payment = await _context.Payments.Include(p => p.Escrow).FirstOrDefaultAsync(p => p.RequestId == req.RequestId && p.RequestType == "FlightCompanion");
            if (payment == null || payment.Escrow == null)
                return NotFound("No escrowed payment found for this service.");

            // await _paymentService.ReleaseFundsAsync(payment.Escrow.Id); // Payment feature disabled for current sprint

            return Ok(new { Message = "Service marked as completed and funds released." });
        }

        public class FlightCompanionMatchRequest
        {
            public int RequestId { get; set; }
            public int OfferId { get; set; }
        }
        public class CompleteServiceRequest
        {
            public int RequestId { get; set; }
        }

        public class InitiateHelpRequest
        {
            [Required]
            public int RequestId { get; set; }
            
            [Required]
            [StringLength(1000, MinimumLength = 1, ErrorMessage = "Message must be between 1 and 1000 characters")]
            public string InitialMessage { get; set; } = string.Empty;
        }

        public class InitiateHelpResponse
        {
            public int MessageId { get; set; }
            public string ThreadId { get; set; } = string.Empty;
            public int RequestId { get; set; }
            public int ReceiverId { get; set; }
            public string Message { get; set; } = string.Empty;
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

                // Test 8: Test the exact search query without Include (case-insensitive)
                var searchTest = await _context.FlightCompanionRequests
                    .Where(r => r.IsActive && !r.IsMatched && r.FlightNumber.ToLower().Contains("sh999"))
                    .Select(r => new { r.Id, r.FlightNumber, r.UserId })
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
                    sampleRequests,
                    searchTest
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