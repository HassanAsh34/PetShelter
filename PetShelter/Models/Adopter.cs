using System.ComponentModel.DataAnnotations;

namespace PetShelter.Models
{
	public class Adopter : User
	{
		
		[Required]
		[MinLength(15)]
		[MaxLength(255)]
		public string Address { get; set; }

		[Required]
		[Phone(ErrorMessage = "Please make sure your phone number is valid")]
		public string Phone { get; set; }

	}
}
