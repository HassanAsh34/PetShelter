using PetShelter.Models;
using System.ComponentModel.DataAnnotations;

namespace PetShelter.DTOs
{
	public class AdoptionRequestDto
	{
		public int AdopterId { get; set; }
		//public ApplicationUser? Adopter { get; set; }
		public int PetId { get; set; }
		//public Pet? Pet { get; set; }

		public string? Status { get; set; }
	}
}
