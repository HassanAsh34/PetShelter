using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using PetShelter.DTOs;

namespace PetShelter.Models
{
	//[Index(nameof(CategoryName),IsUnique =true)]
	[Index(nameof(CategoryName), nameof(Shelter_FK), IsUnique = true)]
	public class ShelterCategory
	{

		[Key]
		//[DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public int CategoryId { get; set; }

		[MaxLength(255)]
		[MinLength(2,ErrorMessage ="Category name cant be shorter than 2 characters")]
		[Required]
		public string CategoryName { get; set; }


		[MaxLength(255)]
		[MinLength(20, ErrorMessage = "please write at least a breif description of that category")]
		[Required]
		public string CategoryDescription { get; set; }

		public int Shelter_FK { get; set; } // foreign key

		[JsonIgnore]
		public Shelter ?Shelter { get; set; } // navigation property 

		[JsonIgnore]
		public List<Animal> ?Animal { get; set; } //navigation property
	}
}
