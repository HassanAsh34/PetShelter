using System.ComponentModel.DataAnnotations;

namespace PetShelter.Models
{
	public class AdoptionRequest
	{
		//[Key
		//public int Id { get; set; }

		
		public int AdopterId { get; set; }
		//public ApplicationUser? Adopter { get; set; }
		
		public int PetId { get; set; }
		//public Pet? Pet { get; set; }

		public AdoptionRequestStatus? Status { get; set; }
		public DateTime RequestDate { get; set; }
		public DateTime? InterviewDate { get; set; }

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
