using Microsoft.AspNetCore.Identity.Data;
using PetShelter.Models;
using BCrypt.Net;
using PetShelter.Repository;
using PetShelter.DTOs;

namespace PetShelter.Services
{
    public class UserService
	{
		private readonly UserRepository _userRepository;

		public UserService(UserRepository userRepository) 
		{
			_userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
		}

		public async Task<UserDto> Login(LoginDto login)
		{
			var User = await _userRepository.GetUserDetails(login.Email);
			if (User != null)
			{
				if (BCrypt.Net.BCrypt.Verify(login.Password, User.Password))
				{
					switch(User)
					{
						case Admin admin:
							//case (int)User.UserType.Admin:
							//admin = User as Admin;
							return new AdminDto
							{
								Id = admin.Id,
								Email = admin.Email,
								Uname = admin.Uname,
								Role = (Models.User.UserType)admin.Role,
								Activated = admin.Activated,
								adminType = (Admin.AdminTypes)admin.AdminType
							};//handle token generation for admin and adopter
						case Adopter adopter:
							return new AdopterDto
							{
								Id = adopter.Id,
								Email = adopter.Email,
								Uname = adopter.Uname,
								Role = (Models.User.UserType)adopter.Role,
								Activated = adopter.Activated,
								Address = adopter.Address,
								Phone = adopter.Phone
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
			if (await _userRepository.UserExistence(user.Email) == false)
			{
				user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
				switch(await _userRepository.RegisterUser(user))
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
							Shelter_FK = staff.Shelter_FK
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

		public User.UserType getType(int type)
		{
			return (User.UserType)type;
		}
	}
}


