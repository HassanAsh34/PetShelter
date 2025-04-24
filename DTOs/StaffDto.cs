using System.ComponentModel.DataAnnotations;
using PetShelter.Models;

namespace PetShelter.DTOs
{
	public class StaffDto : UserDto
	{
		[Required]
		[Phone(ErrorMessage = "Please make sure your phone number is valid")]
		public string Phone { get; set; }

		public DateOnly? HiredDate { get; set; }

		public int Shelter_FK { get; set; }

		[Required]
		public ShelterStaff.StaffTypes StaffType { get; set; }
	}
}
