using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetShelter.Models
{
	public class Animal
	{
		[Key]
		//[DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public int id { get; set; }

		[DisplayName("Pet'sName")]
		[Required]
		[MinLength(3, ErrorMessage = "Please make sure you wrote the pet's name correctly")]
		[MaxLength(50)]
		public string name { get; set; }

		[Required]
		//[MaxLength(int.MaxValue)]
		public int age { get; set; }

		//[Required]
		//public int category_id { get; set; } //fk

		[Required]
		[MinLength(2,ErrorMessage ="Invalid breed")]
		public string breed { get; set; }

		public int Adoption_State { get; set; }

		//[ForeignKey("")]
		public int Category_FK { get; set; } // navigation property

		public int ?Shelter_FK { get; set; } // navigation property

		public ShelterCategory ?ShelterCategory { get; set; } // navigation property

		public Shelter? Shelter { get; set; } // navigation property
		public enum AdoptionState
		{
			Adopted,
			pending,
			Available
		}
		[Required]
		[MinLength(15, ErrorMessage = "Please write a brief description of the pet's medication history")]
		[MaxLength(255)]
		public string medication_history { get; set; }

		public Animal()
		{
			Adoption_State = (int)AdoptionState.Available;
		}
	}
}
