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

		public async Task<IEnumerable<AnimalDto>> ListPets(int? CatId = 0)
		{
			IEnumerable<Animal> animals = await _adoptionRepository.ListPets(CatId);
			List<AnimalDto> animalDtos = new List<AnimalDto>();
			animals.ToList().ForEach(animal =>
			{
				animalDtos.Add(new AnimalDto
				{
					id = animal.id,
					name = animal.name,
					Adoption_State = ((Animal.AdoptionState)animal.Adoption_State).ToString(),
					age = animal.age,
					breed = animal.breed
				});
			});
			if(animalDtos.Count() == 0)
			{
				return null;//not found
			}
			else
			{
				return animalDtos;
			}
		}

		public async Task<object> Adopt(AdoptionRequest adoption)
		{
			if (adoption != null)
			{
				var res = await _adoptionRepository.Adopt(adoption);
				if (res is AdoptionRequest adoptionRequest)
				{
					return new AdoptionRequestDto
					{
						//id = res.id,
						PetId = adoptionRequest.PetId,
						AdopterId = adoptionRequest.AdopterId,
						Status = adoptionRequest.Status.ToString(),
					};
				}
				else
					return 0;// adoption failed
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
						PetId = adoption.PetId,
						AdopterId = adoption.AdopterId,
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
