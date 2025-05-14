using System.Security.AccessControl;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetShelter.Data;
using PetShelter.DTOs;
using PetShelter.Models;

namespace PetShelter.Repository
{
    public static class AdopterExtensions
    {
        public static string ToString(this Adopter a)
        {
            return $"{a.Id},{a.Address},{a.Role},{a.Phone}";
        }
    }

    public class UserRepository
    {
        private readonly Db_Context _context;

        public UserRepository(Db_Context context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }
        public async Task<User> Login(string email)
        {
            //await _context.Users.FirstOrDefaultAsync(u => u.Email.Equals(email));
            var User = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower().Trim() == email);
            if (User != null)
            {
                switch (User.Role)
                {
                    case (int)User.UserType.Admin:
                        {
                            var Admin = await  _context.Admins.FirstOrDefaultAsync(a => a.Id == User.Id);
                            return Admin;
						}
                    case (int)User.UserType.Adopter:
                        {
                            var Adopter = await _context.Adopters.FirstOrDefaultAsync(a => a.Id == User.Id);
                            return Adopter;
                        }
                    case (int)User.UserType.ShelterStaff:
                        {
                            var Staff = await _context.Staff.FirstOrDefaultAsync(s => s.Id == User.Id);
                            return Staff;
                        }
                }
            }
            return null;
        }
        public async Task<bool> UserExistence(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email );
            if (user == null)
            {
                return false;
            }
            else
            {
                return true;
            }
        }
        public async Task<User> RegisterUser(User user,bool ? Admin = false)
        {
            //switch (user.Role)
			switch (user)
			{
				case Adopter adopter:
					{
                        //var adopter = user as Adopter;
                        if (adopter != null)
                        {
                            adopter.Activated = 1;
                            adopter.ActivatedAt = DateTime.Now;
                            await _context.Adopters.AddAsync(adopter);
                            await _context.SaveChangesAsync();
                            return adopter;
                        }
                        break;
                    }
                case ShelterStaff staff:
                    {
                        Shelter shelter = await _context.Shelters.FirstOrDefaultAsync(s=>s.ShelterID == staff.Shelter_FK);
						if (staff != null)
                        {
                            if(Admin == true)
                            {
                                staff.Activated = 1;
                                staff.HiredDate = DateOnly.FromDateTime(DateTime.Now);
                                staff.ActivatedAt = DateTime.Now;
                                staff.Shelter_FK = staff.Shelter_FK;
								staff.Shelter = shelter;
							}
                            else
                            {
                                staff.Activated = 0;
                                staff.Shelter_FK = 1;
                                staff.Shelter = null;
                            }
                            // Ensure staff type is properly set and valid
                            if (staff.StaffType >= 0 && staff.StaffType <= 2)
                            {
                                staff.StaffType = staff.StaffType;
                            }
                            else
                            {
                                throw new ArgumentException("Invalid staff type value");
                            }
							await _context.Staff.AddAsync(staff);
							await _context.SaveChangesAsync();
							return staff;  
                        }
                        break;
                    }
                default:
                    throw new ArgumentException("Invalid user type.");
            }
            return null;
        }

        public async Task<int> UpdateUser(UserDto user, bool? deleted = false)
        {
            try
            {
                switch (user)
                {
                    case AdminDto admin:
                        var adminUser = await _context.Admins.FirstOrDefaultAsync(A => A.Id == user.Id);
                        if (adminUser != null)
                        {
                            adminUser.Uname = admin.Uname;
                            adminUser.AdminType = (int)admin.adminType;
                            adminUser.UpdatedAt = DateTime.Now;
                            if (deleted == true)
                            {
                                adminUser.Deleted_At = DateTime.Now;
                            }
                        }
                        break;
                    case StaffDto staff:
                        var staffUser = await _context.Staff.FirstOrDefaultAsync(s => s.Id == user.Id);
                        if (staffUser != null)
                        {
                            staffUser.Phone = staff.Phone;
                            staffUser.Uname = staff.Uname;
                            staffUser.StaffType = (int)staff.StaffType;
                            staffUser.UpdatedAt = DateTime.Now;
                            if (deleted == true)
                            {
                                staffUser.Deleted_At = DateTime.Now;
                            }
                        }
                        break;
                    case AdopterDto adopter:
                        var adopterUser = await _context.Adopters.FirstOrDefaultAsync(a => a.Id == user.Id);
                        if (adopterUser != null)
                        {
                            adopterUser.Phone = adopter.Phone;
                            adopterUser.Uname = adopter.Uname;
                            adopterUser.Address = adopter.Address;
                            adopterUser.UpdatedAt = DateTime.Now;
                            if (deleted == true)
                            {
                                adopterUser.Deleted_At = DateTime.Now;
                            }
                        }
                        break;
                    default:
                        return 0;
                }
                return await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating user: {ex.Message}");
                return 0;
            }
        }

        public async Task<int> DeleteUser(UserDto user)
        {
            return await UpdateUser(user, true);
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
					if (adopter != null)
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
					ShelterStaff staff = await _context.Staff.Where(adopter => adopter.Id == id).Include(s => s.Shelter).FirstOrDefaultAsync();
					if (staff != null)
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
								ShelterName = staff.Shelter.ShelterName,
                                ShelterLocation = staff.Shelter.Location,
                                ShelterPhone = staff.Shelter.Phone
							}
						};
					}
					else
						return null;
				default:
					return null;
			}
		}
	}
}
