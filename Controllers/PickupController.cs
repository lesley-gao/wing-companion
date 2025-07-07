using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetworkingApp.Data;
using NetworkingApp.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
                .Include(pr => pr.MatchedDriver)
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
            var request = await _context.PickupRequests
                .Include(pr => pr.User)
                .Include(pr => pr.MatchedDriver)
                .FirstOrDefaultAsync(pr => pr.Id == id);

            if (request == null)
            {
                return NotFound();
            }

            return request;
        }

        // POST: api/Pickup/requests
        [HttpPost("requests")]
        public async Task<ActionResult<PickupRequest>> CreateRequest(PickupRequest request)
        {
            _context.PickupRequests.Add(request);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRequest), new { id = request.Id }, request);
        }

        // POST: api/Pickup/offers
        [HttpPost("offers")]
        public async Task<ActionResult<PickupOffer>> CreateOffer(PickupOffer offer)
        {
            _context.PickupOffers.Add(offer);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOffers), new { id = offer.Id }, offer);
        }

        // GET: api/Pickup/match/{requestId}
        [HttpGet("match/{requestId}")]
        public async Task<ActionResult<IEnumerable<PickupOffer>>> FindMatches(int requestId)
        {
            var request = await _context.PickupRequests.FindAsync(requestId);
            if (request == null)
            {
                return NotFound();
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
            var request = await _context.PickupRequests.FindAsync(matchRequest.RequestId);
            var offer = await _context.PickupOffers.FindAsync(matchRequest.OfferId);

            if (request == null || offer == null)
            {
                return NotFound();
            }

            request.IsMatched = true;
            request.MatchedDriverId = offer.Id;
            offer.TotalPickups++;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Pickup/requests/airport/{airport}
        [HttpGet("requests/airport/{airport}")]
        public async Task<ActionResult<IEnumerable<PickupRequest>>> GetRequestsByAirport(string airport)
        {
            return await _context.PickupRequests
                .Include(pr => pr.User)
                .Where(pr => pr.IsActive && pr.Airport == airport)
                .OrderBy(pr => pr.ArrivalDate)
                .ToListAsync();
        }
    }

    public class PickupMatchRequest
    {
        public int RequestId { get; set; }
        public int OfferId { get; set; }
    }
}
