using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetShelter.Models
{
	public class Animal
	{
		[Key]
		[DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		int id { get; set; }

		string name { get; set; }
		int age { get; set; }
		string category { get; set; }
		string breed { get; set; }
		string medication_history { get; set; }

		int Adoption_State { get; set; }

		private enum AdoptionState
		{
			Adopted,
			pending,
			Available
		}

		public Animal()
		{
			Adoption_State = (int)AdoptionState.Available;
		}
	}
}
