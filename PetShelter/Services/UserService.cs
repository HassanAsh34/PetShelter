using Microsoft.AspNetCore.Identity.Data;
using PetShelter.Models;
using BCrypt.Net;
using PetShelter.Repository;
using PetShelter.DTOs;
using System.Text.Json;

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
			var User = await _userRepository.GetUserDetails(login.Email.ToLower().Trim());
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
								HiredDate = staff.HiredDate,
								Shelter_FK = staff.Shelter_FK
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
			Console.WriteLine($"UserService.Register called with user: {JsonSerializer.Serialize(user)}");
			
			// Check if user already exists
			if (await _userRepository.UserExistence(user.Email))
			{
				Console.WriteLine($"User with email {user.Email} already exists");
				return null;
			}

			// Hash the password
			user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
			Console.WriteLine("Password hashed successfully");

			// Register the user based on their role
			var registeredUser = await _userRepository.RegisterUser(user);
			Console.WriteLine($"User registered successfully: {JsonSerializer.Serialize(registeredUser)}");

			if (registeredUser == null)
			{
				Console.WriteLine("Registration failed: UserRepository.RegisterUser returned null");
				return null;
			}

			// Convert to DTO based on user type
			switch (registeredUser)
			{
				case Admin admin:
					return new AdminDto
					{
						Id = admin.Id,
						Email = admin.Email,
						Uname = admin.Uname,
						Role = (Models.User.UserType)admin.Role,
						Activated = admin.Activated,
						adminType = (Admin.AdminTypes)admin.AdminType
					};
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
						HiredDate = staff.HiredDate,
						Shelter_FK = staff.Shelter_FK
					};
				default:
					Console.WriteLine($"Unknown user type: {registeredUser.GetType()}");
					return null;
			}
		}

		public async Task<bool> UpdateUserDetails(UserDto u)
		{
			var U = await _userRepository.UpdateUser(u);
			if (U > 0)
				return true;
			else
				return false;
			//return null;
		}

		public User.UserType getType(int type)
		{
			return (User.UserType)type;
		}
	}
}


