using PetShelter.Models;

namespace PetShelter.DTOs
{
	public class ShelterDto
	{
		public int ShelterId { get; set; }

		public string ShelterName { get; set; }

		public string ShelterLocation { get; set; }

		public string ShelterPhone { get; set; }

		public string Description { get; set; }

		//return shelter manager name
		//public ShelterManagerDto ShelterManager { get; set; }

		public int CountStaff { get; set; }

        //public int CountAnimals { get; set; }
        public IEnumerable<ShelterCategory>? Categories { get; set; }

		public IEnumerable<StaffDto> ?staff { get; set; }
	}
}
