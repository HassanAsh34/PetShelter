using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

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

		public int Shelter_FK { get; set; }

		[JsonIgnore]
		public Shelter? Shelter { get; set; }

		public enum StaffTypes
		{
			Manager,
			interviewer,
			CareTaker
		}
	}
}
