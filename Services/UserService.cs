using Microsoft.AspNetCore.Identity.Data;
using PetShelter.Models;
using BCrypt.Net;
using PetShelter.Repository;
using PetShelter.DTOs;

namespace PetShelter.Services
{
    public class UserService
	{
		private readonly UserRepository _userRepositroy;

		public UserService(UserRepository userRepository) 
		{
			_userRepositroy = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
		}

		public async Task<UserDto> Login(LoginDto login)
		{
			var User = await _userRepositroy.GetUserDetails(login.Email);
			if (User != null)
			{
				if (BCrypt.Net.BCrypt.Verify(login.Password, User.Password))
				{
					switch(User)
					{
						case Admin admin:
						//case (int)User.UserType.Admin:
							//admin = User as Admin;
							AdminDto adminDto = new AdminDto
							{
								Id = admin.Id,
								Email = admin.Email,
								Name = admin.Uname,
								Role = (Models.User.UserType)admin.Role,
								Activated = admin.Activated,
								adminType = (Admin.AdminTypes)admin.AdminType
							};
							return adminDto;//handle token generation for admin and adopter
						default:
							return new UserDto
							{
								Id = User.Id,
								Email = User.Email,
								Name = User.Uname,
								Role = (Models.User.UserType)User.Role,
								Activated = User.Activated
							};
					}
				}
				return null;
			}
			else
			{
				return null;
			}
		}

		public async Task<UserDto> Register(User user)
		{
			if (await _userRepositroy.UserExistense(user.Email) == false)
			{
				user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
				await _userRepositroy.RegisterUser(user);
				return new UserDto
				{
					Id = user.Id,
					Email = user.Email,
					Name = user.Uname,
					Role = (Models.User.UserType)user.Role
				};
			}
			else
				return null; //indicates that the user exists
		}

		public User.UserType getType(int type)
		{
			return (User.UserType)type;
		}
	}
}


