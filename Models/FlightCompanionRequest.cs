using System;
using System.ComponentModel.DataAnnotations;

namespace NetworkingApp.Models
{
    public class FlightCompanionRequest
    {
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public virtual User User { get; set; }
        
        [Required]
        [StringLength(100)]
        public string FlightNumber { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Airline { get; set; }
        
        [Required]
        public DateTime FlightDate { get; set; }
        
        [Required]
        [StringLength(10)]
        public string DepartureAirport { get; set; } // AKL, PVG, etc.
        
        [Required]
        [StringLength(10)]
        public string ArrivalAirport { get; set; }
        
        [StringLength(100)]
        public string TravelerName { get; set; } // Name of person needing help (e.g., "My parents")
        
        [StringLength(20)]
        public string TravelerAge { get; set; } // "Elderly", "Adult", etc.
        
        [StringLength(500)]
        public string SpecialNeeds { get; set; } // Wheelchair, medical, language help, etc.
        
        [Range(0, 500)]
        public decimal OfferedAmount { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        [StringLength(1000)]
        public string AdditionalNotes { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Status tracking
        public bool IsMatched { get; set; } = false;
        public int? MatchedCompanionId { get; set; }
        public virtual FlightCompanionOffer MatchedCompanion { get; set; }
    }
}
