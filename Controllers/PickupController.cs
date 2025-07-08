// Enhanced PickupController.cs with validation
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetworkingApp.Data;
using NetworkingApp.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations; 

namespace NetworkingApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PickupController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PickupController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Pickup/requests
        [HttpGet("requests")]
        public async Task<ActionResult<IEnumerable<PickupRequest>>> GetRequests()
        {
            return await _context.PickupRequests
                .Include(pr => pr.User)
                .Include(pr => pr.MatchedOffer)
                .Where(pr => pr.IsActive)
                .OrderByDescending(pr => pr.CreatedAt)
                .ToListAsync();
        }

        // GET: api/Pickup/offers
        [HttpGet("offers")]
        public async Task<ActionResult<IEnumerable<PickupOffer>>> GetOffers()
        {
            return await _context.PickupOffers
                .Include(po => po.User)
                .Where(po => po.IsAvailable)
                .OrderByDescending(po => po.CreatedAt)
                .ToListAsync();
        }

        // GET: api/Pickup/requests/5
        [HttpGet("requests/{id}")]
        public async Task<ActionResult<PickupRequest>> GetRequest(int id)
        {
            if (id <= 0)
            {
                return BadRequest("Invalid request ID.");
            }

            var request = await _context.PickupRequests
                .Include(pr => pr.User)
                .Include(pr => pr.MatchedOffer)
                .FirstOrDefaultAsync(pr => pr.Id == id);

            if (request == null)
            {
                return NotFound($"Pickup request with ID {id} not found.");
            }

            return request;
        }

        // POST: api/Pickup/requests
        [HttpPost("requests")]
        public async Task<ActionResult<PickupRequest>> CreateRequest(PickupRequest request)
        {
            // Validate model state
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Additional business validation
            if (request.ArrivalDate <= DateTime.UtcNow.Date)
            {
                ModelState.AddModelError("ArrivalDate", "Arrival date must be in the future.");
                return BadRequest(ModelState);
            }

            if (request.OfferedAmount < 0)
            {
                ModelState.AddModelError("OfferedAmount", "Offered amount cannot be negative.");
                return BadRequest(ModelState);
            }

            if (request.PassengerCount <= 0 || request.PassengerCount > 8)
            {
                ModelState.AddModelError("PassengerCount", "Passenger count must be between 1 and 8.");
                return BadRequest(ModelState);
            }

            // Validate airport codes
            var validAirports = new[] { "AKL", "WLG", "CHC", "ZQN", "ROT" };
            if (!validAirports.Contains(request.Airport?.ToUpper()))
            {
                ModelState.AddModelError("Airport", "Invalid airport code.");
                return BadRequest(ModelState);
            }

            // Set default values and timestamps
            request.CreatedAt = DateTime.UtcNow;
            request.IsActive = true;
            request.IsMatched = false;

            _context.PickupRequests.Add(request);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRequest), new { id = request.Id }, request);
        }

        // POST: api/Pickup/offers
        [HttpPost("offers")]
        public async Task<ActionResult<PickupOffer>> CreateOffer(PickupOffer offer)
        {
            // Validate model state
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Additional business validation
            if (offer.BaseRate < 0)
            {
                ModelState.AddModelError("BaseRate", "Base rate cannot be negative.");
                return BadRequest(ModelState);
            }

            if (offer.MaxPassengers <= 0 || offer.MaxPassengers > 12)
            {
                ModelState.AddModelError("MaxPassengers", "Maximum passengers must be between 1 and 12.");
                return BadRequest(ModelState);
            }

            // Validate airport codes
            var validAirports = new[] { "AKL", "WLG", "CHC", "ZQN", "ROT" };
            if (!validAirports.Contains(offer.Airport?.ToUpper()))
            {
                ModelState.AddModelError("Airport", "Invalid airport code.");
                return BadRequest(ModelState);
            }

            // Set default values and timestamps
            offer.CreatedAt = DateTime.UtcNow;
            offer.IsAvailable = true;
            offer.TotalPickups = 0;
            offer.AverageRating = 0;

            _context.PickupOffers.Add(offer);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOffers), new { id = offer.Id }, offer);
        }

        // GET: api/Pickup/match/{requestId}
        [HttpGet("match/{requestId}")]
        public async Task<ActionResult<IEnumerable<PickupOffer>>> FindMatches(int requestId)
        {
            if (requestId <= 0)
            {
                return BadRequest("Invalid request ID.");
            }

            var request = await _context.PickupRequests.FindAsync(requestId);
            if (request == null)
            {
                return NotFound($"Pickup request with ID {requestId} not found.");
            }

            // Find matching pickup offers (same airport and can handle requirements)
            var matches = await _context.PickupOffers
                .Include(po => po.User)
                .Where(po => po.IsAvailable &&
                             po.Airport == request.Airport &&
                             po.MaxPassengers >= request.PassengerCount &&
                             (!request.HasLuggage || po.CanHandleLuggage))
                .OrderBy(po => po.BaseRate)
                .ToListAsync();

            return matches;
        }

        // PUT: api/Pickup/match
        [HttpPut("match")]
        public async Task<IActionResult> MatchRequestWithOffer([FromBody] PickupMatchRequest matchRequest)
        {
            // Validate model state
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (matchRequest.RequestId <= 0 || matchRequest.OfferId <= 0)
            {
                return BadRequest("Invalid request ID or offer ID.");
            }

            var request = await _context.PickupRequests.FindAsync(matchRequest.RequestId);
            var offer = await _context.PickupOffers.FindAsync(matchRequest.OfferId);

            if (request == null)
            {
                return NotFound($"Pickup request with ID {matchRequest.RequestId} not found.");
            }

            if (offer == null)
            {
                return NotFound($"Pickup offer with ID {matchRequest.OfferId} not found.");
            }

            if (request.IsMatched)
            {
                return BadRequest("Request is already matched.");
            }

            if (!offer.IsAvailable)
            {
                return BadRequest("Offer is no longer available.");
            }

            // Validate compatibility
            if (offer.MaxPassengers < request.PassengerCount)
            {
                return BadRequest("Offer cannot accommodate the required number of passengers.");
            }

            if (request.HasLuggage && !offer.CanHandleLuggage)
            {
                return BadRequest("Offer cannot handle luggage requirements.");
            }

            // Update match status
            request.IsMatched = true;
            request.MatchedOfferId = offer.Id;
            offer.TotalPickups++;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Pickup/requests/airport/{airport}
        [HttpGet("requests/airport/{airport}")]
        public async Task<ActionResult<IEnumerable<PickupRequest>>> GetRequestsByAirport(string airport)
        {
            if (string.IsNullOrWhiteSpace(airport))
            {
                return BadRequest("Airport code is required.");
            }

            var validAirports = new[] { "AKL", "WLG", "CHC", "ZQN", "ROT" };
            if (!validAirports.Contains(airport.ToUpper()))
            {
                return BadRequest($"Invalid airport code: {airport}");
            }

            return await _context.PickupRequests
                .Include(pr => pr.User)
                .Where(pr => pr.IsActive && pr.Airport.ToUpper() == airport.ToUpper())
                .OrderBy(pr => pr.ArrivalDate)
                .ToListAsync();
        }
    }

    public class PickupMatchRequest
    {
        [Range(1, int.MaxValue, ErrorMessage = "Request ID must be greater than 0.")]
        public int RequestId { get; set; }
        
        [Range(1, int.MaxValue, ErrorMessage = "Offer ID must be greater than 0.")]
        public int OfferId { get; set; }
    }
}