using PetShelter.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace PetShelter.DTOs
{
	public class AnimalDto 
	{
		public int id { get; set; }

		[DisplayName("Pet'sName")]
		[Required]
		[MinLength(3, ErrorMessage = "Please make sure you wrote the pet's name correctly")]
		[MaxLength(50)]
		public string name { get; set; }

		[Required]
		[MaxLength(int.MaxValue)]
		public int age { get; set; }

		[Required]
		[MinLength(2, ErrorMessage = "Invalid breed")]
		public string breed { get; set; }

		public string Adoption_State { get; set; }

		//public ShelterCategory ShelterCategory { get; set; }
	}
}
