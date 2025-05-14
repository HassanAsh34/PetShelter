// Repository/SeedRepository.cs
using PetShelter.Data;
using PetShelter.Models;
using Microsoft.EntityFrameworkCore;

public class SeedRepository
{
	private readonly Db_Context _context;

	public SeedRepository(Db_Context context)
	{
		_context = context ?? throw new ArgumentNullException(nameof(context));
	}

	public async Task SeedInitialDataAsync()
	{
		await _context.Database.EnsureCreatedAsync();

		await AddShelterWithUnsetCategoryAsync("Deleted");
		await AddShelterWithUnsetCategoryAsync("Unassigned");
		await AddAdminAccount();
		await _context.SaveChangesAsync();
	}

	private async Task AddShelterWithUnsetCategoryAsync(string shelterName)
	{
		if (!await _context.Shelters.AnyAsync(s => s.ShelterName == shelterName))
		{
			Shelter shelter = _context.Shelters.Add(new Shelter { ShelterName = shelterName, Description = "",Location = "", Phone = "" }).Entity;
			await _context.SaveChangesAsync();

			var category = new ShelterCategory
			{
				Shelter_FK = shelter.ShelterID,
				CategoryName = "Unset",
				//CategoryDescription = ""
			};
			_context.Categories.Add(category);
		}
	}

	private async Task AddAdminAccount()
	{
		if(await _context.Users.FirstOrDefaultAsync(u=>u.Email.ToLower().Contains("Admin@Shelter.com".ToLower()))==null)
		{
			Admin admin = new Admin()
			{
				AdminType = (int)Admin.AdminTypes.SuperAdmin,
				Email = "Admin@Shelter.com",
				Uname = "Admin",
				Activated = 1,
				ActivatedAt = DateTime.Now,
				CreatedAt = DateTime.Now,
				UpdatedAt = DateTime.Now,
				Role = (int)User.UserType.Admin,
				Password = BCrypt.Net.BCrypt.HashPassword("Admin123")
			};
			_context.Add(admin);
		}
	}
}
