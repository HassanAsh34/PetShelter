using System.Runtime.InteropServices;
using PetShelter.Data;
using PetShelter.DTOs;
using PetShelter.Models;
using PetShelter.Repository;

namespace PetShelter.Services
{
    public class AdminServices
	{
		private readonly AdminRepository _adminRepository;

		private readonly UserRepository _userRepository;
		public AdminServices(AdminRepository adminRepository,UserRepository userRepository)
		{
			_adminRepository = adminRepository ?? throw new ArgumentNullException(nameof(adminRepository));

			_userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
		}

		public async Task<IEnumerable<UserDto>> ListUsers()
		{
			return await _adminRepository.GetUsers();
		}

		public async Task<UserDto> getUserDetails(int id)
		{
			return await _adminRepository.GetUser(id);
		}

		public async Task<string> ToggleUserActivation(UserDto user,bool ? Ban =false)
		{
			var res = await _adminRepository.ToggleUserActivation(user,Ban);
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
			if (await _userRepository.UserExistense(user.Email) == false)
			{
				user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
				switch (await _userRepository.RegisterUser(user))
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
							HiredDate = staff.HiredDate
						};
					default:
						return new AdopterDto
						{

						};
				}
			}
			else
				return null; //indicates that the user exists
		}

		public async Task<AdminDto> addAdmin(Admin admin)
		{
			if (await _userRepository.UserExistense(admin.Email) == false)
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

		public async Task<UserDto> UpdateUserDetails(UserDto u)
		{
			//var U = await _adminRepository.UpdateUser(u);
			return null;
		}
		public async Task<bool> deleteUser(UserDto u)
		{
			var res =  await _adminRepository.DeleteUser(u);
			if(res>0)
			{
				return true;
			}
			return false;
		}

		//Activating and deactivating Account not implemented yet

		//shelter services
		public async Task<ShelterCategory> addCategory(ShelterCategory category)
		{
			return await _adminRepository.addCategory(category);
		}

		public async Task<IEnumerable<ShelterCategory>> ListCategories()
		{
			return await _adminRepository.ListShelterCategories();
		}

		public async Task<bool> deleteCategory(ShelterCategory category)
		{
			var res = await _adminRepository.deleteCategory(category);
			if (res > 0)
			{
				return true;
			}
			return false;
		}

		//edit category need to be handled

	}
}
