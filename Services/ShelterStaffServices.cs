using PetShelter.DTOs;
using PetShelter.Models;
using PetShelter.Repository;

namespace PetShelter.Services
{
	public class ShelterStaffServices
	{
		private ShelterStaffRepository _shelterStaffRepository;
		public ShelterStaffServices(ShelterStaffRepository shelterStaffRepository)
		{
			_shelterStaffRepository = shelterStaffRepository ?? throw new ArgumentNullException(nameof(shelterStaffRepository));
		}



		public async Task<IEnumerable<ShelterCategory>> ListCategories()
		{
			IEnumerable<ShelterCategory> categories = await _shelterStaffRepository.listCategories();
			if (categories == null)
			{
				return Enumerable.Empty<ShelterCategory>();
			}
			else
				return categories;
		}
		public async Task<IEnumerable<AnimalDto>> ListPets(int ?CatId = 0)
		{
			IEnumerable<Animal> animals = await _shelterStaffRepository.ListPets(CatId);
			List<AnimalDto> animalDtos = new List<AnimalDto>();
			animals.ToList().ForEach(animal => {
				animalDtos.Add(new AnimalDto
				{
					id = animal.id,
					name = animal.name,
					Adoption_State = ((Animal.AdoptionState)animal.Adoption_State).ToString(),
					age = animal.age,
					breed = animal.breed
				});
			});
			return animalDtos;
		}
		public async Task<int> AddPet(Animal animal)
		{
			if (await _shelterStaffRepository.CategoryExistence(animal.Category_FK) == true)
			{
				var res = await _shelterStaffRepository.AddPet(animal);
				if (res > 0)
				{
					//return new AnimalDto
					//{
					//	id = animal.id,
					//	name = animal.name,
					//	Adoption_State = (Animal.AdoptionState)animal.Adoption_State,
					//	age = animal.age,
					//	breed = animal.breed
					//};
					return res;
				}
				else
				{
					return -1; //something went wrong
				}
			}
			else
				return 0; // category not found
		}

		public async Task<Animal> ViewPet(int id)
		{
			Animal pet = await _shelterStaffRepository.ViewPet(id);
			if(pet == null)
			{
				return null; //pet not found
			}
			else
				return pet;
			//return pet;
		}

		public async Task<object> UpdatePet(Animal animal)
		{
			var res = await _shelterStaffRepository.UpdatePet(animal);
			if (res > 0)
			{
				return new AnimalDto
				{
					id = animal.id,
					name = animal.name,
					Adoption_State = animal.Adoption_State.ToString(),
					age = animal.age,
					breed = animal.breed
				};
			}
			else
			{
				return res;
			}
		}
		public async Task<bool> RemovePet(AnimalDto p)
		{
			var res = await _shelterStaffRepository.DeletePet(p);
			if (res > 0)
			{
				return true;
			}
			return false;
		}
	}
}
