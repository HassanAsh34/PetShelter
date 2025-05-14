using System.Text.Json.Serialization;

namespace PetShelter.Models
{
	public class Interview
	{
		public int id { get; set; }

		public int AdoptionRequest_fk { get; set; }// foreign key
		[JsonIgnore]
		public AdoptionRequest? AdoptionRequest { get; set; }// navigation property

		public DateOnly? InterviewDate { get; set; }
	}
}
