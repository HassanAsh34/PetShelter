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

		//public async Task<IEnumerable<UserDto>> GetUsers(bool UnassignedStaff)
		//{
		//	var users = UnassignedStaff == true ? await _context.Staff.Select(user => new { user.Id, user.Uname, user.Email, user.Role, user.Activated, user.Banned_At ,user.}).Where(user => user.)
		//				  .ToListAsync(): await _context.Users
		//				  .Select(user => new { user.Id, user.Uname, user.Email, user.Role, user.Activated, user.Banned_At })
		//				  .ToListAsync();
		//	List<UserDto> userDtos = new List<UserDto>();
		//	users.ForEach(user =>
		//	{
		//		switch ((User.UserType)user.Role)
		//		{
		//			case User.UserType.Admin:

		//				userDtos.Add(
		//					new AdminDto
		//					{
		//						Id = user.Id,
		//						Uname = user.Uname,
		//						Email = user.Email,
		//						Role = (User.UserType)user.Role,
		//						Activated = user.Activated,
		//						banned = user.Banned_At != null ? true : false
		//					}
		//					);
		//				break;
		//			case User.UserType.Adopter:
		//				userDtos.Add(
		//					new AdopterDto
		//					{
		//						Id = user.Id,
		//						Uname = user.Uname,
		//						Email = user.Email,
		//						Role = (User.UserType)user.Role,
		//						Activated = user.Activated,
		//						banned = user.Banned_At != null ? true : false
		//					}
		//					);
		//				break;
		//			case User.UserType.ShelterStaff:
		//				userDtos.Add(
		//				new StaffDto
		//				{
		//					Id = user.Id,
		//					Uname = user.Uname,
		//					Email = user.Email,
		//					Role = (User.UserType)user.Role,
		//					Activated = user.Activated,
		//					banned = user.Banned_At != null ? true : false
		//				});
		//				break;
		//		}

		//	});
		//	return userDtos;
		//	//return await from User select new 
		//}


		public async Task<IEnumerable<UserDto>> GetUsers(bool ?unassignedStaff = false)
		{
			var userDtos = new List<UserDto>();

			if (unassignedStaff == true)
			{
				var unassigned = await _context.Staff
					.Where(s => s.Shelter_FK == 1)
					.Select(user => new {
						user.Id,
						user.Uname,
						user.Email,
						user.Role,
						user.Activated,
						user.Banned_At
					})
					.ToListAsync();

				unassigned.ForEach(user =>
				{
					userDtos.Add(new StaffDto
					{
						Id = user.Id,
						Uname = user.Uname,
						Email = user.Email,
						Role = (User.UserType)user.Role,
						Activated = user.Activated,
						banned = user.Banned_At != null
					});
				});
			}
			else
			{
				var users = await _context.Users
					.Select(user => new {
						user.Id,
						user.Uname,
						user.Email,
						user.Role,
						user.Activated,
						user.Banned_At
					})
					.ToListAsync();

				users.ForEach(user =>
				{
					switch ((User.UserType)user.Role)
					{
						case User.UserType.Admin:
							userDtos.Add(new AdminDto
							{
								Id = user.Id,
								Uname = user.Uname,
								Email = user.Email,
								Role = (User.UserType)user.Role,
								Activated = user.Activated,
								banned = user.Banned_At != null
							});
							break;
						case User.UserType.Adopter:
							userDtos.Add(new AdopterDto
							{
								Id = user.Id,
								Uname = user.Uname,
								Email = user.Email,
								Role = (User.UserType)user.Role,
								Activated = user.Activated,
								banned = user.Banned_At != null
							});
							break;
						case User.UserType.ShelterStaff:
							userDtos.Add(new StaffDto
							{
								Id = user.Id,
								Uname = user.Uname,
								Email = user.Email,
								Role = (User.UserType)user.Role,
								Activated = user.Activated,
								banned = user.Banned_At != null
							});
							break;
					}
				});
			}

			return userDtos;
		}


		public async Task<UserDto> GetUser(int id, int role)
		{
			//var user = await _context.Users.Where(user => user.Id == id && user.Role == role).FirstOrDefaultAsync();
			//if (role)
			//{
			switch (role)
			{
				case (int)User.UserType.Admin:
					Admin admin = await _context.Admins.Where(admin => admin.Id == id).FirstOrDefaultAsync();
					if (admin != null)
					{
						return new AdminDto
						{
							Id = admin.Id,
							Uname = admin.Uname,
							Email = admin.Email,
							Activated = admin.Activated,
							adminType = (Admin.AdminTypes)admin.AdminType,
							Role = User.UserType.Admin,
							CreatedAt = admin.CreatedAt
						};
					}
					else
						return null;
				case (int)User.UserType.Adopter:
					Adopter adopter = await _context.Adopters.Where(adopter => adopter.Id == id).FirstOrDefaultAsync();
					if(adopter != null)
					{
						return new AdopterDto
						{
							Id = adopter.Id,
							Uname = adopter.Uname,
							Email = adopter.Email,
							Activated = adopter.Activated,
							Role = User.UserType.Adopter,
							Address = adopter.Address,
							Phone = adopter.Phone,
							CreatedAt = adopter.CreatedAt
						};
					}
					else
						return null;
				case (int)User.UserType.ShelterStaff:
					ShelterStaff staff = await _context.Staff.Where(adopter => adopter.Id == id).Include(s=>s.Shelter).FirstOrDefaultAsync();
					if(staff != null)
					{
						return new StaffDto
						{
							Id = staff.Id,
							Uname = staff.Uname,
							Email = staff.Email,
							Role = (User.UserType)staff.Role,
							Phone = staff.Phone,
							StaffType = (ShelterStaff.StaffTypes)staff.StaffType,
							Activated = staff.Activated,
							HiredDate = staff.HiredDate,
							CreatedAt = staff.CreatedAt,
							Shelter = new ShelterDto
							{
								ShelterId = staff.Shelter.ShelterID,
								ShelterName = staff.Shelter.ShelterName
							}
						};
					}
					else
						return null;
				default:
					return null;
			}
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

		public async Task<int> ToggleUserActivation(UserDto user, bool? Banned = false)
		{
			var User = await _context.Users.FirstOrDefaultAsync(u => u.Id == user.Id);
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

		public async Task<int> UpdateUser(UserDto U)
		{
			return await _userRepository.UpdateUser(U);
		}

		//public async Task<bool> DeleteUser(UserDto U)
		public async Task<int> DeleteUser(UserDto U)
		{
			var res = await _context.Users.FirstOrDefaultAsync(u => u.Id == U.Id);
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
		public async Task<object> addCategory(ShelterCategory shelterCategory)
		{
			var res = await _context.Categories.FirstOrDefaultAsync(c=>c.CategoryName.ToLower().Contains(shelterCategory.CategoryName.ToLower())&&c.Shelter_FK==shelterCategory.Shelter_FK);
			if (res == null)
			{
				await _context.Categories.AddAsync(shelterCategory);
				await _context.SaveChangesAsync();
				return shelterCategory;
			}
			else
				return 0; //which means that category exists
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

		public async Task<int> deleteCategory(ShelterCategory? category = null, bool? all = false,int ?shelterID =0)
		{
			if (all == true && shelterID != 0)
			{
				var allCategories = await _context.Categories.Where(c=>c.Shelter_FK == shelterID).ToListAsync();
				if (allCategories.Any())
				{
					_context.Categories.RemoveRange(allCategories);
					return await _context.SaveChangesAsync();
				}
				return 0; // nothing to delete
			}

			if (category != null)
			{
				var res = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryId == category.CategoryId);
				if (res != null)
				{
					_context.Categories.Remove(res);
					return await _context.SaveChangesAsync();
				}
			}

			return -1; // category not found
		}


		//shelter

		public async Task<bool> ShelterExistence(Shelter shelter)
		{
			var res = await _context.Shelters.FirstOrDefaultAsync(a => a.ShelterName.ToLower() == (shelter.ShelterName != null ? shelter.ShelterName.ToLower() : "") || a.ShelterID == shelter.ShelterID);
			if (res != null)
			{
				return true;
			}
			else
				return false;
		}
		public async Task<Shelter> AddShelter(Shelter shelter)
		{
			if (shelter != null)
			{
				await _context.Shelters.AddAsync(shelter);
				await _context.SaveChangesAsync();
				return shelter;
			}
			else
				return null;
		}

		public async Task<int> AssignToShelter(StaffDto staff)
		{
			ShelterStaff s = await _context.Staff.FirstOrDefaultAsync(s => s.Id == staff.Id);
			if (s != null)
			{
				s.Shelter_FK = staff.Shelter_FK;
				s.HiredDate = DateOnly.FromDateTime(DateTime.Now);
				return await _context.SaveChangesAsync();
			}
			else
				return -1;//indicates that the staff does not exist
		}

		public async Task<object> ShowShelter(int ? id = 0)
		{
			if(id!=0)
			{
				Shelter shelter = await _context.Shelters
					.Include(s => s.Staff)
					.Include(s => s.Category)
					.FirstOrDefaultAsync(s => s.ShelterID == id);
				if(shelter != null)
				{
					return shelter;
				}
				else
					return null; //indicates that the shelter does not exist
			}
			else
			{
                return await _context.Shelters
					.Include(s => s.Staff)
					.Include(s => s.Category)
					.ToListAsync();
            }
		}

		//public async Task<IEnumerable<Shelter>> ListShelters()
		//{
		//	return await _context.Shelters.ToListAsync();
		//}

		public async Task<int> DeleteShelter(Shelter shelter)
		{
			Shelter s = await _context.Shelters.FirstOrDefaultAsync(s => s.ShelterID == shelter.ShelterID);
			if(s != null)
			{
				_context.Remove(s);
				return await _context.SaveChangesAsync();
			}
			else
				return -1; //indicates that the shelter does not exist
		}

		public async Task<int> UnassignFromShelter(int id)
		{
			List<ShelterStaff> s = await _context.Staff.Where(s=>s.Shelter_FK == id).ToListAsync();
			s.ForEach(staff =>
			{
				staff.Shelter_FK = 1;
			});
			return await _context.SaveChangesAsync();
			//else
			//	return -1; //indicates that there is no staff in that shelter
		}

		public async Task<DashboardStatsDto> GetDashboardStats()
		{
			// var startOfMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
			// var endOfMonth = startOfMonth.AddMonths(1).AddSeconds(-1);

			return new DashboardStatsDto
			{
				TotalShelters = await _context.Shelters.CountAsync(),
				TotalPets = await _context.Animals.CountAsync(),
				TotalUsers = await _context.Users.CountAsync(),
				ActiveUsers = await _context.Users.CountAsync(u=>u.Activated == 1),
				// List<AdoptionRequestDto> AdoptionReq = await _context.AdoptionRequest.ToListAsync(),
					// .CountAsync(a => a.RequestDate >= startOfMonth && a.RequestDate <= endOfMonth),
				PendingAdoptions = await _context.AdoptionRequest
					.CountAsync(a => a.Status == AdoptionRequest.AdoptionRequestStatus.Pending),
				TotalAdoptions = await _context.AdoptionRequest.CountAsync()
			};
		}
	}
}
