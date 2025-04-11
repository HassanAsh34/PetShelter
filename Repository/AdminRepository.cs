using System.Collections;
using Microsoft.EntityFrameworkCore;
using PetShelter.Data;
using PetShelter.DTOs;
using PetShelter.Models;

namespace PetShelter.Repository
{
    public class AdminRepository
	{
		private readonly Db_Context _context;
		public AdminRepository(Db_Context context)
		{
			_context = context ?? throw new ArgumentNullException(nameof(context));
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
						break;
				}
				
			});
			return userDtos;
			//return await from User select new 
		}

		public async Task<UserDto> GetUser(int id)
		{
			var user = await _context.Users.Where(user => user.Id == id).Select(user => new { user.Id, user.Role }).FirstOrDefaultAsync();
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
						Activated= adopter.Activated,
						Role = User.UserType.Adopter,
						Address = adopter.Address,
						Phone = adopter.Phone,
					};
				case (int)User.UserType.ShelterStaff:
					return null;
				default:
					return null;
			}
		}
		public async Task<User> AddUser(User user)
		{
			//switch (user.Role)
			switch (user)
			{
				//case (int)User.UserType.Adopter:
				case Adopter adopter:
					{
						//var adopter = user as Adopter;
						if (adopter != null)
						{
							adopter.Activated = true;
							adopter.ActivatedAt = DateTime.Now;
							await _context.Adopters.AddAsync(adopter);
							await _context.SaveChangesAsync();
							return adopter;
						}
						break;
					}
				//case (int)User.UserType.ShelterStaff:
				//    {
				//        return null;
				//    }
				default:
					throw new ArgumentException("Invalid user type.");
			}
			return null;
		}
		public async Task<User> AddAdmin(Admin admin)
		{
			if (admin != null)
			{
				admin.Activated = true;
				admin.ActivatedAt = DateTime.Now;
				await _context.Users.AddAsync(admin);
				await _context.SaveChangesAsync();
				return admin;
			}
			else
				return null;
		}

		//public async Task<UserDto> UpdateUser(UserDto U)
		//{
			

		//}

		public async Task<bool> DeleteUser(UserDto U)
		{

			var sql = "DELETE FROM Users WHERE Id = @p0";
			var res = _context.Database.ExecuteSqlRaw(sql, U.Id);
			//int res = await _context.Users.Where(u => u.Id == U.Id).ExecuteDeleteAsync();
			await _context.SaveChangesAsync();
			return (res > 0);
		}
	}
}
