using System.ComponentModel.DataAnnotations;

namespace PetShelter.Models
{
	public class ShelterStaff : User
	{
		[Required]
		[Phone(ErrorMessage = "Please make sure your phone number is valid")]
		public string Phone { get; set; }

		public DateOnly ?HiredDate { get; set; }

		[Required]
		public int StaffType { get; set; }

		public enum StaffTypes
		{
			Manager,
			interviewer,
			CareTaker
		}
	}
}
