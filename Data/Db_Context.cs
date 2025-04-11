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

		public DbSet<ShelterCategories> Shelters { get; set; }

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

			modelBuilder.Entity<Animal>().HasOne(C => C.ShelterCategories).WithMany(A => A.Animal).HasForeignKey(A=>A.category_id);

			modelBuilder.Entity<ShelterCategories>().ToTable("ShelterCategory");

		}

	}
}
