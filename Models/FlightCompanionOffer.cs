using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace NetworkingApp.Models
{
    public class FlightCompanionOffer
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
        public string DepartureAirport { get; set; }
        
        [Required]
        [StringLength(10)]
        public string ArrivalAirport { get; set; }
        
        [StringLength(200)]
        public string AvailableServices { get; set; } // "Translation, Navigation, General Help"
        
        [StringLength(50)]
        public string Languages { get; set; } // "Chinese, English"
        
        [Range(0, 500)]
        public decimal RequestedAmount { get; set; }
        
        public bool IsAvailable { get; set; } = true;
        
        [StringLength(1000)]
        public string AdditionalInfo { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Experience tracking
        public int HelpedCount { get; set; } = 0;
        
        // Navigation properties
        public virtual ICollection<FlightCompanionRequest> MatchedRequests { get; set; } = new List<FlightCompanionRequest>();
    }
}
