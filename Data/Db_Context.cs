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

		//protected override void OnModelCreating(ModelBuilder modelBuilder)
		//{
		//	modelBuilder.Entity<User>()
		//		.HasDiscriminator<string>("Discriminator")
		//		.HasValue<User>("User")
		//		.HasValue<Adopter>("Adopter")
		//		.HasValue<Admin>("Admin");
		//}
		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			modelBuilder.Entity<User>()
				.ToTable("Users");

			modelBuilder.Entity<Adopter>()
				.ToTable("Adopters");

			modelBuilder.Entity<Admin>()
				.ToTable("Admins");
		}

	}
}
