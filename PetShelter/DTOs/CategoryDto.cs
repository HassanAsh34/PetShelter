using PetShelter.Models;

namespace PetShelter.DTOs
{
	public class CategoryDto
	{
		public int CategoryId { get; set; }

		public string CategoryName { get; set; }

		public ShelterDto? Shelter { get; set; }
	}
}
