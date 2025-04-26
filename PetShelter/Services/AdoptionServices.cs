using Microsoft.AspNetCore.Mvc;
using PetShelter.DTOs;
using PetShelter.Models;
using PetShelter.Repository;

namespace PetShelter.Services
{
	public class AdoptionServices
	{
		private readonly AdoptionRepository _adoptionRepository;

		public AdoptionServices(AdoptionRepository adoptionRepository)
		{
			_adoptionRepository = adoptionRepository ?? throw new ArgumentNullException(nameof(adoptionRepository));
		}

		public async Task<IEnumerable<AnimalDto>> ListPets(string? catname ="")//done
		{
			IEnumerable<Animal> animals = await _adoptionRepository.ListPets(0,0,catname);
			//IEnumerable<Animal> animals = await _shelterStaffRepository.ListPets(CatId);
			if (animals != null)
			{
				List<AnimalDto> animalDtos = new List<AnimalDto>();
				animals.ToList().ForEach(animal =>
				{
					animalDtos.Add(new AnimalDto
					{
						id = animal.id,
						name = animal.name,
						Adoption_State = ((Animal.AdoptionState)animal.Adoption_State).ToString(),
						age = animal.age,
						breed = animal.breed,
						ShelterCategory = new CategoryDto
						{
							CategoryId = animal.ShelterCategory.CategoryId,
							CategoryName = animal.ShelterCategory.CategoryName,
						},
						shelterDto = new ShelterDto
						{
							ShelterId = animal.Shelter.ShelterID,
							ShelterName = animal.Shelter.ShelterName,
							ShelterLocation = animal.Shelter.Location,
							ShelterPhone = animal.Shelter.Phone,
						}
					});
				});
				return animalDtos;
			}
			else
			{
				return null; //no content
			}
		}

		public async Task<int> Adopt(AdoptionRequest adoption)
		{
			if (adoption != null)
			{
				if(await _adoptionRepository.RequestExistence(adoption))
				{
					return 0;// request exist
				}
				else
				{
					return await _adoptionRepository.Adopt(adoption);
				}
			}
			else
				return -1;// something went wrong
		}

		public async Task<object> AdoptionHistory(int id)
		{
			if(id!=0)
			{
				IEnumerable<AdoptionRequest> res = await _adoptionRepository.AdoptionHistory(id);
				List<AdoptionRequestDto> adoptionRequestDtos = new List<AdoptionRequestDto>();
				res.ToList().ForEach(adoption =>
				{
					adoptionRequestDtos.Add(new AdoptionRequestDto
					{
						Animal = new AnimalDto
						{
							id = adoption.Pet.id,
							name = adoption.Pet.name,
						},
						Adopter = new AdopterDto
						{
							Id = adoption.AdopterId_FK,
							Uname = adoption.Adopter.Uname,
						},
						Status = ((AdoptionRequest.AdoptionRequestStatus)adoption.Status).ToString(),
					});
				});
				if (adoptionRequestDtos == null)
				{
					return 0; //nothing was found
				}
				else
				{
					return adoptionRequestDtos;
				}
			}
			return -1;//something went wrong
		}

		public async Task<bool> CancelAdoption(int id)
		{
			if (id != 0)
			{
				bool res = await _adoptionRepository.CancelAdoption(id);
				if (res == true)
				{
					return true;
				}
				else
					return false;
			}
			return false;//something went wrong
		}

		public async Task<object> ShowPet(int id)
		{
			var res = await _adoptionRepository.ShowPet(id);
			if (res != null)
			{
				return res;
			}
			else
				return null;
			//}
			//return -1;//something went wrong
		}
	}
}
