using PetShelter.Models;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PetShelter.DTOs
{
	public class AdoptionRequestDto
	{
		
		public int requestId { get; set; }
		//public int AdopterId { get; set; }
		////public ApplicationUser? Adopter { get; set; }
		//public int PetId { get; set; }
		////public Pet? Pet { get; set; }
		//public int ShelterId { get; set; } // navigation property

		public ShelterDto ?Shelter { get; set; } // navigation property

		public AnimalDto ?Animal { get; set; }

		public AdopterDto ?Adopter { get; set; }
		public string? Status { get; set; }

        /////////////////////////
        public InterviewDto? interviewDto { get; set; }
        /////////////////////////

        public DateTime RequestDate { get; set; }

		public DateTime? Approved_At { get; set; }

	}
}
