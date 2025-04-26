using System.ComponentModel.DataAnnotations;
using PetShelter.DTOs;

namespace PetShelter.Models
{
	public class AdoptionRequest
	{
		[Key]
		public int Id { get; set; }


		public int AdopterId_FK { get; set; }
		//public ApplicationUser? Adopter { get; set; }
		public Adopter ?Adopter { get; set; }

		public int PetId_FK { get; set; }
		//public Pet? Pet { get; set; }

		public Animal? Pet { get; set; }
		public int Shelter_FK { get; set; } // navigation property

		public Shelter? Shelter { get; set; } // navigation property
		public AdoptionRequestStatus? Status { get; set; }
		public DateTime RequestDate { get; set; }

		//public DateTime? InterviewDate { get; set; }

		public DateTime? Approved_At { get; set; }


		//public AdoptionRequest()
		//{
		//	Status = AdoptionRequestStatus.Pending;

		//	RequestDate = DateTime.Now;
		//}
		public enum AdoptionRequestStatus
		{
			Pending,
			Approved,
			Rejected
		}
	}

}
