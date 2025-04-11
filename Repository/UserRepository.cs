using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetShelter.Data;
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
            var User = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
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
                            return null;
                        }
                }
            }
            return null;
        }
        public async Task<bool> UserExistense(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                return false;
            }
            else
            {
                return true;
            }
        }
        public async Task<User> RegisterUser(User user)
        {
            //switch (user.Role)
			switch (user)
			{
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
    }
}
