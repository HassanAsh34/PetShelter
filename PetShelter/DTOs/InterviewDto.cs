using PetShelter.Models;

namespace PetShelter.DTOs
{
	public class InterviewDto
	{
		public int id { get; set; }

		public AdopterDto? Adopter { get; set; } // navigation property

		public AdoptionRequestDto? AdoptionRequest { get; set; }// navigation property
 

		public DateTime? InterviewDate { get; set; }
	}
}
