using Microsoft.EntityFrameworkCore;
using NetworkingApp.Models;

namespace NetworkingApp.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<FlightCompanionRequest> FlightCompanionRequests { get; set; }
        public DbSet<FlightCompanionOffer> FlightCompanionOffers { get; set; }
        public DbSet<PickupRequest> PickupRequests { get; set; }
        public DbSet<PickupOffer> PickupOffers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User relationships
            modelBuilder.Entity<FlightCompanionRequest>()
                .HasOne(fcr => fcr.User)
                .WithMany(u => u.FlightCompanionRequests)
                .HasForeignKey(fcr => fcr.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<FlightCompanionOffer>()
                .HasOne(fco => fco.User)
                .WithMany(u => u.FlightCompanionOffers)
                .HasForeignKey(fco => fco.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PickupRequest>()
                .HasOne(pr => pr.User)
                .WithMany(u => u.PickupRequests)
                .HasForeignKey(pr => pr.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PickupOffer>()
                .HasOne(po => po.User)
                .WithMany(u => u.PickupOffers)
                .HasForeignKey(po => po.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure matching relationships
            modelBuilder.Entity<FlightCompanionRequest>()
                .HasOne(fcr => fcr.MatchedCompanion)
                .WithMany(fco => fco.MatchedRequests)
                .HasForeignKey(fcr => fcr.MatchedCompanionId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<PickupRequest>()
                .HasOne(pr => pr.MatchedDriver)
                .WithMany(po => po.MatchedRequests)
                .HasForeignKey(pr => pr.MatchedDriverId)
                .OnDelete(DeleteBehavior.SetNull);

            // Configure decimal precision
            modelBuilder.Entity<FlightCompanionRequest>()
                .Property(fcr => fcr.OfferedAmount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<FlightCompanionOffer>()
                .Property(fco => fco.RequestedAmount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<PickupRequest>()
                .Property(pr => pr.OfferedAmount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<PickupOffer>()
                .Property(po => po.BaseRate)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<PickupOffer>()
                .Property(po => po.AverageRating)
                .HasColumnType("decimal(3,2)");
        }
    }
}
