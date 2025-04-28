using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.Text.Json.Serialization; // Make sure to import this namespace

namespace PetShelter.Models
{
	public class Shelter
	{
		[Key]
		public int ShelterID { get; set; }

		[Required]
		[MinLength(3, ErrorMessage = "Please make sure that the Shelter's name is written correctly")]
		[MaxLength(50)]
		public string ShelterName { get; set; }

		[Required]
		[MinLength(3, ErrorMessage = "Please make sure that the Shelter's LOCATION is written correctly")]
		public string? Location { get; set; }

		[Required]
		[Phone(ErrorMessage = "Please make sure that Shelter's phone number is valid")]
		public string? Phone { get; set; }

		[Required]
		[MinLength(15, ErrorMessage = "Please write a brief description of the Shelter")]
		[MaxLength(255)]
		public string? Description { get; set; }

		[JsonIgnore]
		public IEnumerable<ShelterStaff>? Staff { get; set; }
		[JsonIgnore]
		public IEnumerable<ShelterCategory>? Category { get; set; }

		// Add the Animals navigation property here
		[JsonIgnore]
		public IEnumerable<Animal>? Animals { get; set; } 
	}
}
