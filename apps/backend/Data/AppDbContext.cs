using Microsoft.EntityFrameworkCore;
using BookingApi.Models;

namespace BookingApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<EventType> EventTypes => Set<EventType>();
    public DbSet<Slot> Slots => Set<Slot>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<EventType>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
        });

        modelBuilder.Entity<Slot>(entity =>
        {
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.GuestEmail).IsRequired().HasMaxLength(200);
            entity.Property(e => e.GuestName).IsRequired().HasMaxLength(200);
        });
    }
}
