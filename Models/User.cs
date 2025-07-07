using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace NetworkingApp.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        
        [Phone]
        public string Phone { get; set; }
        
        [StringLength(10)]
        public string Language { get; set; } // "Chinese", "English", "Both"
        
        public bool IsVerified { get; set; }
        
        [StringLength(500)]
        public string Bio { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ICollection<FlightCompanionRequest> FlightCompanionRequests { get; set; } = new List<FlightCompanionRequest>();
        public virtual ICollection<FlightCompanionOffer> FlightCompanionOffers { get; set; } = new List<FlightCompanionOffer>();
        public virtual ICollection<PickupRequest> PickupRequests { get; set; } = new List<PickupRequest>();
        public virtual ICollection<PickupOffer> PickupOffers { get; set; } = new List<PickupOffer>();
    }
}
