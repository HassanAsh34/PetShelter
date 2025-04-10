using System.ComponentModel.DataAnnotations;

namespace PetShelter.Models
{
	public class ShelterCategories
	{
		
		public int CategoryId { get; set; }

		[MaxLength(255)]
		[MinLength(2,ErrorMessage ="Category name cant be shorter than 2 characters")]
		[Required]
		public string CategoryName { get; set; }


		[MaxLength(255)]
		[MinLength(20, ErrorMessage = "please write at least a breif description of that category")]
		[Required]
		public string CategoryDescription { get; set; }

		public List<Animal> Animal { get; set; } //navigation property
	}
}
