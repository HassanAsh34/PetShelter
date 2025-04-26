using PetShelter.Models;

namespace PetShelter.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Uname { get; set; }
        public string Email { get; set; }
        public User.UserType Role { get; set; }

        public bool banned { get; set; }
		public int Activated { get; set; }

    }
}
