using System.Text.Json.Serialization;
using PetShelter.Models;

namespace PetShelter.DTOs
{
	public class InterviewDto
	{
		public int id { get; set; }


        [JsonIgnore]
        public AdopterDto? Adopter { get; set; } // navigation property

        [JsonIgnore]
        public AdoptionRequestDto? AdoptionRequest { get; set; }// navigation property

        ////////////////////////////////////////////////
        [JsonIgnore]
        public AnimalDto? animal { get; set; }
        /////////////////////////////////////////////////

        public DateOnly? InterviewDate { get; set; }
	}
}
