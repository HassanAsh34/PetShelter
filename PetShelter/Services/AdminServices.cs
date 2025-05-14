using System.Runtime.InteropServices;
using PetShelter.Data;
using PetShelter.DTOs;
//using PetShelter.Migrations;
using PetShelter.Models;
using PetShelter.Repository;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using PetShelter.Hubs;

namespace PetShelter.Services
{
	public class AdminServices : BaseService
	{
		private readonly AdminRepository _adminRepository;
		
		public AdminServices(AdminRepository adminRepository, IHubContext<DashboardHub> hubContext) 
			: base(hubContext) // Remove adminServices parameter
		{
			_adminRepository = adminRepository ?? throw new ArgumentNullException(nameof(adminRepository));
		}

		public async Task<IEnumerable<UserDto>> ListUsers(bool? UnassignedStaff = false)
		{
			return await _adminRepository.GetUsers(UnassignedStaff);
		}

		public async Task<UserDto> getUserDetails(int id, int role)
		{
			return await _adminRepository.GetUser(id, role);
		}

		public async Task<string> ToggleUserActivation(UserDto user, bool? Ban = false)
		{
			var res = await _adminRepository.ToggleUserActivation(user, Ban);
			switch (res)
			{
				case 0:
					return "Account was deactivated successfully";
				case 1:
					return "Account is ready to use";
				case 2:
					return "Account was banned successfully";
				default:
					return "Something went wrong";
			}
		}

		public async Task<UserDto> addUser(User user)
		{
			if (await _adminRepository.UserExistence(user) == false)
			{
				user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
				switch (await _adminRepository.AddUser(user))
				{
					case Adopter adopter:
						return new AdopterDto
						{
							Id = adopter.Id,
							Uname = adopter.Uname,
							Email = adopter.Email,
							Role = (User.UserType)adopter.Role,
							Phone = adopter.Phone,
							Address = adopter.Address,
							Activated = adopter.Activated,

						};
					case ShelterStaff staff:
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
							Shelter = staff.Shelter != null ? new ShelterDto
							{
								ShelterId = staff.Shelter.ShelterID,
								ShelterName = staff.Shelter.ShelterName,
								ShelterLocation = staff.Shelter.Location,
								ShelterPhone = staff.Shelter.Phone,
							} : null
						};
					default:
						return null;
				}
			}
			else
				return null; //indicates that the user exists
		}

		public async Task<AdminDto> addAdmin(Admin admin)
		{
			if (await _adminRepository.UserExistence(admin) == false)
			{
				admin.Password = BCrypt.Net.BCrypt.HashPassword(admin.Password);
				var Admin = await _adminRepository.AddAdmin(admin);
				return new AdminDto
				{
					Id = admin.Id,
					Uname = admin.Uname,
					Email = admin.Email,
					Role = User.UserType.Admin,
					adminType = (Admin.AdminTypes)admin.AdminType
				};
			}
			else
				return null;
		}

		public async Task<bool> UpdateUserDetails(UserDto u)
		{
			var U = await _adminRepository.UpdateUser(u);
			if (U > 0)
			{
				var stats = await GetDashboardStats();
				await NotifyDashboardUpdate(stats);
				return true;
			}
			else
				return false;
		}

		public async Task<bool> deleteUser(UserDto u)
		{
			var res = await _adminRepository.DeleteUser(u);
			if (res > 0)
			{
				var stats = await GetDashboardStats();
				await NotifyDashboardUpdate(stats);
				return true;
			}
			return false;
		}

		//Activating and deactivating Account not implemented yet

		//shelter services
		public async Task<object> addCategory(ShelterCategory category)
		{
			var res = await _adminRepository.addCategory(category);
			if (res is ShelterCategory cat)
			{
				var stats = await GetDashboardStats();
				await NotifyDashboardUpdate(stats);
				return new CategoryDto
				{
					CategoryId = cat.CategoryId,
					CategoryName = cat.CategoryName
				};
			}
			else
				return res;
		}

		public async Task<IEnumerable<CategoryDto>> ListCategories(int ? id =0)
		{
			List<ShelterCategory> categories = await _adminRepository.ListShelterCategories(id);
			List<CategoryDto> categoryDtos = new List<CategoryDto>();
			categories.ForEach(c =>
			{
				categoryDtos.Add(new CategoryDto()
				{
					CategoryName = c.CategoryName,
					CategoryId = c.CategoryId,
					AnimalCount = c.Animal?.Count() ?? 0,
					Shelter = new ShelterDto
					{
						ShelterId = c.Shelter.ShelterID,
						ShelterName = c.Shelter.ShelterName
					}
				});
			});
			return categoryDtos;
		}

		public async Task<bool> EditCategory(ShelterCategory category)
		{
			var res = await _adminRepository.EditCategory(category);
			if (res > 0)
			{
				var stats = await GetDashboardStats();
				await NotifyDashboardUpdate(stats);
				return true;
			}
			return false;
		}

		public async Task<bool> deleteCategory(ShelterCategory category)
		{
			var res = await _adminRepository.deleteCategory(category);
			if (res > 0)
			{
				var stats = await GetDashboardStats();
				await NotifyDashboardUpdate(stats);
				return true;
			}
			return false;
		}

		//edit category need to be handled


		//shelter

		public async Task<object> addShelter(Shelter shelter)
		{
			if (shelter != null)
			{
				var res = await _adminRepository.AddShelter(shelter);
				if (res is Shelter s)
				{
					var stats = await GetDashboardStats();
					await NotifyDashboardUpdate(stats);
					return new ShelterDto
					{
						ShelterId = s.ShelterID,
						ShelterName = s.ShelterName,
						ShelterLocation = s.Location,
						ShelterPhone = s.Phone,
					};	
				}
				else
				{
					if ((bool)res == false)
						return false;
					else
						return null;//something went wrong
				}
			}
			else
				return null; // indicates that the shelter exists
		}

		public async Task<int> AssignToShelter(StaffDto staff)
		{
			var res = await _adminRepository.AssignToShelter(staff);
			return res;
			//if (res > 0)
			//{
			//	return res;
			//}
			//else
			//{
			//	if (res == -1)
			//	{
			//		return -1; //indicates that the staff does not exist
			//	}
			//	else if (res == -2)
			//	{
			//		return -2; //indicates that the shelter does not exist
			//	}
			//	else
			//	{
			//		return 0; //indicates that nothing changed
			//	}
			//}
		}

		public async Task<object> ShowShelter(int? id = 0)
		{
			var res = await _adminRepository.ShowShelter(id);
			if (res != null)
			{
				switch (res)
				{
					case IEnumerable<Shelter> shelters:
						List<ShelterDto> shelterDtos = new List<ShelterDto>();
						shelters.ToList().ForEach(shelter =>
						{
							shelterDtos.Add(
								new ShelterDto()
								{
									ShelterId = shelter.ShelterID,
									ShelterName = shelter.ShelterName,
									ShelterLocation = shelter.Location,
									ShelterPhone = shelter.Phone,
									Description = shelter.Description,
									CountStaff = shelter.Staff?.Count() ?? 0
								});
						});
						return shelterDtos;
					case Shelter shelter:
						return new ShelterDto()
						{
							ShelterId = shelter.ShelterID,
							ShelterName = shelter.ShelterName,
							ShelterLocation = shelter.Location,
							ShelterPhone = shelter.Phone,
							Description = shelter.Description,
							CountStaff = shelter.Staff?.Count() ?? 0
						};
					default:
						return null;
				}
			}
			else
				return null;
		}

        //public async Task<object> ListShelters()
        //{
        //	IEnumerable<Shelter> res = await _adminRepository.ListShelters();
        //	if (res.Count() != 0)
        //	{
        //		List<ShelterDto> shelterDtos = new List<ShelterDto>();
        //		res.ToList().ForEach(shelter =>
        //		{
        //			shelterDtos.Add(new ShelterDto
        //			{
        //				ShelterId = shelter.ShelterID,
        //				ShelterName = shelter.ShelterName,
        //				ShelterLocation = shelter.Location,
        //				ShelterPhone = shelter.Phone,
        //			});
        //		});
        //		return shelterDtos;
        //	}
        //	else
        //		return null; //indicates that there are no shelters
        //}

        public async Task<int> EditShelter(ShelterDto shelter)
        {
            if (shelter == null)
                return -1;
            else
            {
                return await _adminRepository.EditShelter(shelter);
            }
        }

        public async Task<int> deleteShelter(ShelterDto shelter)
		{
			//await _adminRepository.UnassignFromShelter(shelter.ShelterID);
			//await _adminRepository.deleteCategory(null,true,shelter.ShelterID);
			return await _adminRepository.DeleteShelter(shelter);
		}

		public async Task<DashboardStatsDto> GetDashboardStats()
		{
			return await _adminRepository.GetDashboardStats();
		}
	}
}
