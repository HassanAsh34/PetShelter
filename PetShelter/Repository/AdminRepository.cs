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


		public async Task<IEnumerable<UserDto>> GetUsers(bool? unassignedStaff = false)
		{
			var userDtos = new List<UserDto>();

			if (unassignedStaff == true)
			{
				var unassigned = await _context.Staff
					.Where(s => s.Shelter_FK == 1 && s.Deleted_At == null)
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
				var users = await _context.Users.Where(u => u.Deleted_At == null)
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


		//public async Task<UserDto> GetUser(int id, int role)
		//{
		//	//var user = await _context.Users.Where(user => user.Id == id && user.Role == role).FirstOrDefaultAsync();
		//	//if (role)
		//	//{
		//	switch (role)
		//	{
		//		case (int)User.UserType.Admin:
		//			Admin admin = await _context.Admins.Where(admin => admin.Id == id).FirstOrDefaultAsync();
		//			if (admin != null)
		//			{
		//				return new AdminDto
		//				{
		//					Id = admin.Id,
		//					Uname = admin.Uname,
		//					Email = admin.Email,
		//					Activated = admin.Activated,
		//					adminType = (Admin.AdminTypes)admin.AdminType,
		//					Role = User.UserType.Admin,
		//					CreatedAt = admin.CreatedAt
		//				};
		//			}
		//			else
		//				return null;
		//		case (int)User.UserType.Adopter:
		//			Adopter adopter = await _context.Adopters.Where(adopter => adopter.Id == id).FirstOrDefaultAsync();
		//			if(adopter != null)
		//			{
		//				return new AdopterDto
		//				{
		//					Id = adopter.Id,
		//					Uname = adopter.Uname,
		//					Email = adopter.Email,
		//					Activated = adopter.Activated,
		//					Role = User.UserType.Adopter,
		//					Address = adopter.Address,
		//					Phone = adopter.Phone,
		//					CreatedAt = adopter.CreatedAt
		//				};
		//			}
		//			else
		//				return null;
		//		case (int)User.UserType.ShelterStaff:
		//			ShelterStaff staff = await _context.Staff.Where(adopter => adopter.Id == id).Include(s=>s.Shelter).FirstOrDefaultAsync();
		//			if(staff != null)
		//			{
		//				return new StaffDto
		//				{
		//					Id = staff.Id,
		//					Uname = staff.Uname,
		//					Email = staff.Email,
		//					Role = (User.UserType)staff.Role,
		//					Phone = staff.Phone,
		//					StaffType = (ShelterStaff.StaffTypes)staff.StaffType,
		//					Activated = staff.Activated,
		//					HiredDate = staff.HiredDate,
		//					CreatedAt = staff.CreatedAt,
		//					Shelter = new ShelterDto
		//					{
		//						ShelterId = staff.Shelter.ShelterID,
		//						ShelterName = staff.Shelter.ShelterName
		//					}
		//				};
		//			}
		//			else
		//				return null;
		//		default:
		//			return null;
		//	}
		//}

		// dont forget to ask michel about what to do in Add user function 

		public async Task<UserDto> GetUser(int id, int role)
		{
			return await _userRepository.GetUser(id, role);
		}

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
			return await _userRepository.DeleteUser(U);

		}
		//shelter repo

		public async Task<List<ShelterCategory>> ListShelterCategories(int ? id = 0,CategoryDto ? category = null)
		{
			List<ShelterCategory> shelterCategories = await _context.Categories.Include(c=>c.Shelter).Include(c=>c.Animal).Where(c=>!c.CategoryName.ToLower().Contains("unset") && (id == 0 || c.Shelter_FK == id )).ToListAsync();
			return shelterCategories;
		}

		//public async Task<ShelterCategory> GetCategories(ShelterCategory Category)
		//{
		//	ShelterCategory category = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryName.ToLower().Equals(Category.CategoryName.ToLower()));
		//}

		//categories
		public async Task<object> addCategory(ShelterCategory shelterCategory)
		{
			var res = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryName.ToLower().Contains(shelterCategory.CategoryName.ToLower()) && c.Shelter_FK == shelterCategory.Shelter_FK);
			if (res == null)
			{
				await _context.Categories.AddAsync(shelterCategory);
				await _context.SaveChangesAsync();
				return shelterCategory;
			}
			else
				return 0; //which means that category exists
		}
		public async Task<int> EditCategory(ShelterCategory category)
		{
			ShelterCategory shelterCategory = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryId == category.CategoryId);
			if (shelterCategory == null)
			{
				return -1; //incase not found
			}
			else
			{
				//shelterCategory.CategoryDescription = category.CategoryDescription;
				shelterCategory.CategoryName = category.CategoryName;
				return await _context.SaveChangesAsync(); // number of records changed 
			}
		}

		public async Task<int> deleteCategory(ShelterCategory? category = null, bool? all = false, int? shelterID = 0)
		{
			if (all == true && shelterID != 0)
			{
				var allCategories = await _context.Categories.Where(c => c.Shelter_FK == shelterID).ToListAsync();
				if (allCategories.Any())
				{
					_context.Categories.RemoveRange(allCategories);
					return await _context.SaveChangesAsync();
				}
				return 0; // nothing to delete
			}

			if (category != null)
			{
				ShelterCategory res = await _context.Categories.Include(c => c.Animal).Include(c => c.Shelter).FirstOrDefaultAsync(c => c.CategoryId == category.CategoryId);

				if (res != null)
				{
					List<Animal> animals = res.Animal;
					Shelter shelter = res.Shelter;
					ShelterCategory cat = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryName.ToLower().Contains($"{shelter.ShelterName}-Unset"));
					animals.ForEach(async a =>
					{
						if (a.Adoption_State == (int)Animal.AdoptionState.Adopted)
						{
							//a.Shelter_FK = deleted.ShelterID;
							a.Category_FK = cat.CategoryId;
						}
						else
						{
							_context.RemoveRange(await _context.AdoptionRequest.Where(r => r.PetId_FK == a.id).ToListAsync());
							_context.Remove(a);
						}
					});
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
				Shelter s = _context.Shelters.Add(shelter).Entity;
				await _context.SaveChangesAsync();
				ShelterCategory category = new ShelterCategory()
				{
					Shelter_FK = shelter.ShelterID,
					CategoryName = $"{shelter.ShelterName}-Unset"
					
				};
				_context.Add(category);
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
                return await _context.Shelters.Where(s=>!s.ShelterName.ToLower().Contains("deleted")&& !s.ShelterName.ToLower().Contains("unassigned"))
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
			Shelter Shelter = await _context.Shelters.Include(s=>s.Staff).Include(s=> s.Animals).FirstOrDefaultAsync(s => s.ShelterID == shelter.ShelterID);
			if(Shelter != null)
			{
				Shelter deleted = await _context.Shelters.FirstOrDefaultAsync(s => s.ShelterName.ToLower().Contains("deleted"));
				List<Animal> animals = Shelter.Animals.ToList();
				List<AdoptionRequest> requests = await _context.AdoptionRequest.Where(A => A.Shelter_FK == Shelter.ShelterID).ToListAsync();
				ShelterCategory category = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryName.ToLower().Contains("unset"));
				animals.ForEach(a =>
				{
					if (a.Adoption_State == (int)Animal.AdoptionState.Adopted)
					{
						a.Shelter_FK = deleted.ShelterID;
						a.Category_FK = category.CategoryId;
						requests.Where(r => r.PetId_FK == a.id).ToList().ForEach(r =>
						{
							if (r.Status == AdoptionRequest.AdoptionRequestStatus.Approved)
								r.Shelter_FK = deleted.ShelterID;
							else
								_context.Remove(r);
						});

					}
					else
					{
						_context.RemoveRange(requests.Where(r => r.PetId_FK == a.id).ToList());
						_context.Remove(a);
					}
				});
				await deleteCategory(null, true, Shelter.ShelterID);
				_context.RemoveRange(Shelter.Staff.ToList());
				_context.Remove(Shelter);
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
			List<Shelter> Shelters = await _context.Shelters.Include(s => s.Animals).Where(s => !s.ShelterName.ToLower().Contains("deleted") && !s.ShelterName.ToLower().Contains("unassigned")).ToListAsync();
			List<AdoptionRequest> AdoptionReq = await _context.AdoptionRequest.Where(a => a.Approved_At != null).ToListAsync();
			List<AdoptionRequestDto> RecentRequests = new List<AdoptionRequestDto>();
			AdoptionReq.ForEach(r =>
			{
				RecentRequests.Add(new AdoptionRequestDto()
				{
					requestId = r.Id,
					Adopter = new AdopterDto
					{
						Id = r.Adopter.Id,
						Uname = r.Adopter.Uname
					},
					Animal = new AnimalDto
					{
						id = r.Pet.id,
						name =r.Pet.name
					},
					Approved_At = r.Approved_At
				});
			});
			return new DashboardStatsDto
			{

				//TotalPets = await _context.Animals.Include(s=>s.Shelter).Where(a=> ).CountAsync(),
				//TotalPets = await _context.Animals.Include(a => a.Shelter).Where(a => !a.Shelter.ShelterName.ToLower().Contains("deleted")).CountAsync(),
				TotalShelters = Shelters.Count(),
				TotalUsers = await _context.Users.Where(u => u.Banned_At == null && u.Deleted_At == null).CountAsync(),
				ActiveUsers = await _context.Users.CountAsync(u => u.Activated == 1),
				RecentRequests = RecentRequests,
				ApprovedAdoptions = AdoptionReq
					.Count(),
				TotalAdoptions = await _context.AdoptionRequest.CountAsync()
			};
		}
	}
}
