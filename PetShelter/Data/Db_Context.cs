using Microsoft.EntityFrameworkCore;
using PetShelter.Models;

namespace PetShelter.Data
{
	
	public class Db_Context : DbContext
	{
		public Db_Context(DbContextOptions<Db_Context> options) : base(options)
		{
		}

		// DbSets for each model
		public DbSet<User> Users { get; set; }
		public DbSet<Admin> Admins { get; set; }
		public DbSet<Adopter> Adopters { get; set; }
		public DbSet<ShelterStaff> Staff { get; set; }
		public DbSet<AdoptionRequest> AdoptionRequest { get; set; }
		public DbSet<Animal> Animals { get; set; }
		public DbSet<Shelter> Shelters { get; set; }
		public DbSet<ShelterCategory> Categories { get; set; }

		public DbSet<Interview> Interviews { get; set; } // Added DbSet for Interview
		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);

			// TPT Mapping for User Inheritance
			modelBuilder.Entity<User>().ToTable("Users");
			modelBuilder.Entity<Admin>().ToTable("Admins");
			modelBuilder.Entity<Adopter>().ToTable("Adopters");
			modelBuilder.Entity<ShelterStaff>().ToTable("ShelterStaff");

			// Shelter and Staff one-to-many
			modelBuilder.Entity<Shelter>()
				.HasMany(s => s.Staff)
				.WithOne(staff => staff.Shelter)
				.HasForeignKey(staff => staff.Shelter_FK)
				.OnDelete(DeleteBehavior.Cascade);

			// Shelter and Animals one-to-many
			modelBuilder.Entity<Shelter>()
				.HasMany(s => s.Animals)
				.WithOne(a => a.Shelter)
				.HasForeignKey(a => a.Shelter_FK)
				.OnDelete(DeleteBehavior.Restrict);

			// ShelterCategory and Animals one-to-many
			modelBuilder.Entity<ShelterCategory>()
				.HasMany(sc => sc.Animal)
				.WithOne(a => a.ShelterCategory)
				.HasForeignKey(a => a.Category_FK)
				.OnDelete(DeleteBehavior.Cascade);

			// Shelter and Category one-to-many
			modelBuilder.Entity<Shelter>()
				.HasMany(s => s.Category)
				.WithOne(c => c.Shelter)
				.HasForeignKey(c => c.Shelter_FK)
				.OnDelete(DeleteBehavior.Cascade);

			// AdoptionRequest and Adopter one-to-many
			modelBuilder.Entity<AdoptionRequest>()
				.HasOne(ar => ar.Adopter)
				.WithMany()
				.HasForeignKey(ar => ar.AdopterId_FK)
				.OnDelete(DeleteBehavior.Cascade);

			// AdoptionRequest and Pet one-to-many
			modelBuilder.Entity<AdoptionRequest>()
				.HasOne(ar => ar.Pet)
				.WithMany()
				.HasForeignKey(ar => ar.PetId_FK)
				.OnDelete(DeleteBehavior.Restrict);

			// AdoptionRequest and Shelter one-to-many
			modelBuilder.Entity<AdoptionRequest>()
				.HasOne(ar => ar.Shelter)
				.WithMany()
				.HasForeignKey(ar => ar.Shelter_FK)
				.OnDelete(DeleteBehavior.Restrict);

			// AdoptionRequest and Interview one-to-one

			modelBuilder.Entity<Interview>()
			.HasOne(i => i.AdoptionRequest)
			.WithOne()
			.HasForeignKey<Interview>(i => i.AdoptionRequest_fk)
			.OnDelete(DeleteBehavior.Cascade);
		}
	}
}
