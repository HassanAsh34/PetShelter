using System.ComponentModel.DataAnnotations;

namespace PetShelter.DTOs
{
	public class AdopterDto : UserDto
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
