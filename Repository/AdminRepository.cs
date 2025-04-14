using System.Collections;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using PetShelter.Data;
using PetShelter.DTOs;
using PetShelter.Models;

namespace PetShelter.Repository
{
    public class AdminRepository
	{
		private readonly Db_Context _context;
		private readonly UserRepository _userRepository;

		public AdminRepository(Db_Context context, UserRepository userRepository)
		{
			_context = context ?? throw new ArgumentNullException(nameof(context));
			_userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));

		}

		public async Task<IEnumerable<UserDto>> GetUsers()
		{
			var users= await _context.Users
						  .Select(user => new { user.Id, user.Uname, user.Email, user.Role, user.Activated })
						  .ToListAsync();
			List<UserDto> userDtos = new List<UserDto>();
			users.ForEach(user =>
			{
				switch ((User.UserType)user.Role)
				{
					case User.UserType.Admin:
						
						userDtos.Add(
							new AdminDto
							{
								Id = user.Id,
								Uname = user.Uname,
								Email = user.Email,
								Role = (User.UserType)user.Role,
								Activated = user.Activated,
							}
							);
						break;
					case User.UserType.Adopter:
						userDtos.Add(
							new AdopterDto
							{
								Id = user.Id,
								Uname = user.Uname,
								Email = user.Email,
								Role = (User.UserType)user.Role,
								Activated = user.Activated,
							}
							);
						break;
					case User.UserType.ShelterStaff:
						userDtos.Add(
						new StaffDto
						{
								Id = user.Id,
								Uname = user.Uname,
								Email = user.Email,
								Role = (User.UserType)user.Role,
								Activated = user.Activated
							});
						break;
				}
				
			});
			return userDtos;
			//return await from User select new 
		}

		public async Task<UserDto> GetUser(int id)
		{
			var user = await _context.Users.Where(user => user.Id == id).Select(user => new { user.Id, user.Role }).FirstOrDefaultAsync();
			if (user != null)
			{
				switch (user.Role)
				{
					case (int)User.UserType.Admin:
						Admin admin = await _context.Admins.Where(admin => admin.Id == user.Id).FirstOrDefaultAsync();
						//admin.Password = "";
						return new AdminDto
						{
							Id = admin.Id,
							Uname = admin.Uname,
							Email = admin.Email,
							Activated = admin.Activated,
							adminType = (Admin.AdminTypes)admin.AdminType,
							Role = User.UserType.Admin,
						};
					case (int)User.UserType.Adopter:
						Adopter adopter = await _context.Adopters.Where(adopter => adopter.Id == user.Id).FirstOrDefaultAsync();
						//adopter.Password = "";
						return new AdopterDto
						{
							Id = adopter.Id,
							Uname = adopter.Uname,
							Email = adopter.Email,
							Activated = adopter.Activated,
							Role = User.UserType.Adopter,
							Address = adopter.Address,
							Phone = adopter.Phone,
						};
					case (int)User.UserType.ShelterStaff:
						ShelterStaff staff = await _context.Staff.Where(adopter => adopter.Id == user.Id).FirstOrDefaultAsync();
						return new StaffDto
						{
							Id = staff.Id,
							Uname = staff.Uname,
							Email = staff.Email,
							Role = (User.UserType)staff.Role,
							Phone = staff.Phone,
							StaffType = (ShelterStaff.StaffTypes)staff.StaffType,
							Activated = staff.Activated,
							HiredDate = staff.HiredDate
						};
					default:
						return null;
						{

						}
				}
			}
			else
				return null;
		}

		// dont forget to ask michel about what to do in Add user function 
		public async Task<User> AddUser(User user)
		{
			//switch (user.Role)
			return await _userRepository.RegisterUser(user, true);
		}

		public async Task<bool> UserExistence(User user) 
		{
			return await _userRepository.UserExistence(user.Email);
		}

		public async Task<User> AddAdmin(Admin admin)
		{
			if (admin != null)
			{
				admin.Activated = 1;
				admin.ActivatedAt = DateTime.Now;
				await _context.Users.AddAsync(admin);
				await _context.SaveChangesAsync();
				return admin;
			}
			else
				return null;
		}

		public async Task<int> ToggleUserActivation(UserDto user,bool ?Banned = false)
		{
			var User = await _context.Users.FirstOrDefaultAsync(u=>u.Id == user.Id);
			if (Banned != true)
			{
				if (User.Activated == 0)
				{
					User.ActivatedAt = DateTime.Now;
				}
				User.Activated = User.Activated == 0 ? 1 : 0;
			}
			else
			{
				User.Banned_At = DateOnly.FromDateTime(DateTime.Now); // this convert date time to date
				User.Activated = 2;//Banned
			}
			await _context.SaveChangesAsync();
			return User.Activated;
		}

		//public async Task<UserDto> UpdateUser(UserDto U)
		//{


		//}

		//public async Task<bool> DeleteUser(UserDto U)
		public async Task<int> DeleteUser(UserDto U)
		{
			var res = await _context.Users.FirstOrDefaultAsync(u=> u.Id == U.Id);
			if (res != null)
			{
				_context.Users.Remove(res);
				return await _context.SaveChangesAsync();
			}
			return -1;
		}
		//shelter repo
		
		public async Task<IEnumerable<ShelterCategory>> ListShelterCategories()
		{
			List<ShelterCategory> shelterCategories = await _context.Categories.ToListAsync();
			return shelterCategories;
		}

		//public async Task<ShelterCategory> GetCategories(ShelterCategory Category)
		//{
		//	ShelterCategory category = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryName.ToLower().Equals(Category.CategoryName.ToLower()));
		//}
		public async Task<ShelterCategory> addCategory(ShelterCategory shelterCategory)
		{
			var res = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryName.ToLower().Equals(shelterCategory.CategoryName.ToLower()));
			if (res == null)
			{
				await _context.Categories.AddAsync(shelterCategory);
				await _context.SaveChangesAsync();
				return shelterCategory;
			}
			else
				return null; //which means that category exists
		}
		public async Task<int> editCategory(ShelterCategory category)
		{
			ShelterCategory shelterCategory = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryId == category.CategoryId);
			if (shelterCategory == null)
			{
				return -1; //incase not found
			}
			else
			{
				shelterCategory.CategoryDescription = category.CategoryDescription;
				shelterCategory.CategoryName = category.CategoryName;
				return await _context.SaveChangesAsync(); // number of records changed 
			}
		}

		public async Task<int> deleteCategory(ShelterCategory category)
		{
			ShelterCategory res = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryId == category.CategoryId);
			if(res != null)
			{
				_context.Categories.Remove(res);
				return await _context.SaveChangesAsync();
			}
			return -1; //incase not found
		}
	}
}
