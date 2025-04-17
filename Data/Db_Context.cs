using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using PetShelter.Models;

namespace PetShelter.Data
{
	public class Db_Context : DbContext
	{
		public Db_Context(DbContextOptions<Db_Context>options):base(options)
		{
		}

		public DbSet<User> Users { get; set; }

		public DbSet<Admin> Admins {  get; set; }

		public DbSet<Adopter> Adopters { get; set; }

		public DbSet<Animal> Animals { get; set; }

		public DbSet<ShelterCategory> Categories { get; set; }

		public DbSet<ShelterStaff> Staff { get; set; }

		public DbSet<Shelter> Shelters { get; set; }

		public DbSet<AdoptionRequest> AdoptionRequests { get; set; }

		//protected override void OnModelCreating(ModelBuilder modelBuilder) //single table with descriminator
		//{
		//	modelBuilder.Entity<User>()
		//		.HasDiscriminator<string>("Discriminator")
		//		.HasValue<User>("User")
		//		.HasValue<Adopter>("Adopter")
		//		.HasValue<Admin>("Admin");
		//}
		protected override void OnModelCreating(ModelBuilder modelBuilder) //using tbt
		{
			modelBuilder.Entity<User>()
				.ToTable("Users");

			modelBuilder.Entity<Adopter>()
				.ToTable("Adopters");

			modelBuilder.Entity<Admin>()
				.ToTable("Admins");
			
			modelBuilder.Entity<ShelterStaff>()
				.ToTable("ShelterStaff");

			modelBuilder.Entity<AdoptionRequest>().HasKey(A => new {A.PetId, A.AdopterId });

			modelBuilder.Entity<Animal>().HasOne<ShelterCategory>().WithMany().HasForeignKey(A=>A.Category_FK);

			modelBuilder.Entity<ShelterCategory>().HasOne<Shelter>().WithMany().HasForeignKey(C => C.Shelter_FK).OnDelete(DeleteBehavior.Cascade);

			modelBuilder.Entity<Shelter>().HasIndex("ShelterName").IsUnique();

		}

	}
}
