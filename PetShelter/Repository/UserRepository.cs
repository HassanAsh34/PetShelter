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
        public async Task<User> GetUserDetails(string email)
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

        public async Task<int> UpdateUser(UserDto user)
        {
            switch (user)
            {
                case AdminDto admin:
                    Admin A = await _context.Admins.FirstOrDefaultAsync(A => A.Id == user.Id);
                    //A.Role = (int)admin.Role;
                    A.Email = admin.Email;
                    A.Uname = admin.Uname;
                    A.AdminType = (int)admin.adminType;
                    A.UpdatedAt = DateTime.Now;
                    //return await _context.SaveChangesAsync();
                    break;
                case StaffDto staff:
                    ShelterStaff S = await _context.Staff.FirstOrDefaultAsync(s => s.Id == user.Id);
                    S.Phone = staff.Phone;
                    S.Email = staff.Email;
                    S.Uname = staff.Uname;
                    S.StaffType = (int)staff.StaffType;
                    S.UpdatedAt = DateTime.Now;
                    //return await _context.SaveChangesAsync();
                    break;
                default:
                    break;
            }
			return await _context.SaveChangesAsync();
		}
    }
}
