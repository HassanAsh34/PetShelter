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

		public async Task<UserDto> addUser(User user)
		{
			if (await _userRepository.UserExistense(user.Email) == false)
			{
				user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
				var User = await _adminRepository.AddUser(user);
				switch (User) 
				{
					//case Adopter adopter:
					default:
						return new UserDto
						{
							Id = user.Id,
							Email = user.Email,
							Uname = user.Uname,
							Role = (Models.User.UserType)user.Role
						};
				}
			}
			else
				return null; // user exists
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
			return await _adminRepository.DeleteUser(u);
		}

	}
}
