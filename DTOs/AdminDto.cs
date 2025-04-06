using PetShelter.Models;

namespace PetShelter.DTOs
{
	public class AdminDto : UserDto
	{
		public Admin.AdminTypes adminType { get; set; }
	}
}
