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



		public async Task<object> ListCategories(int sh_fk)
		{
			var categories = await _shelterStaffRepository.listCategories(sh_fk);
			if (categories is IEnumerable<ShelterCategory> cats)
			{
				if (cats.Count() != 0)
				{
					List<CategoryDto> categoryDtos = new List<CategoryDto>();
					cats.ToList().ForEach(cat =>
					{
						categoryDtos.Add(new CategoryDto
						{
							CategoryId = cat.CategoryId,
							CategoryName = cat.CategoryName,
							Shelter = new ShelterDto
							{
								ShelterId = cat.Shelter.ShelterID,
								ShelterName = cat.Shelter.ShelterName,
								ShelterLocation = cat.Shelter.Location,
								ShelterPhone = cat.Shelter.Phone,
							}
						});
					});
					return categoryDtos;
				}
				else
					return 0; // no categories found (empty list) (or return empty list?
			}
			else
				return -1; //not assigned to a shelter at the moment
		}
		public async Task<IEnumerable<AnimalDto>> ListPets(int ?CatId = 0, int? ShelterID = 0)
		{
			IEnumerable<Animal> animals = await _shelterStaffRepository.ListPets(CatId, ShelterID);
			//IEnumerable<Animal> animals = await _shelterStaffRepository.ListPets(CatId);
			if(animals != null)
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
		public async Task<object> AddPet(Animal animal)//need to be edited
		{
			if (await _shelterStaffRepository.CategoryExistence(animal.Category_FK) == true)
			{
				var res = await _shelterStaffRepository.AddPet(animal);
				if (res is Animal)
				{
					return new AnimalDto
					{
						id = animal.id,
						name = animal.name,
						Adoption_State = animal.Adoption_State.ToString(),
						age = animal.age,
						breed = animal.breed
					};
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

		public async Task<Animal> ViewPet(int id) //edit here
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
			if(await _shelterStaffRepository.CategoryExistence(animal.Category_FK) == false)
			{
				return -3; // category not found
			}
			var res = await _shelterStaffRepository.UpdatePet(animal);
			if (res > 0)
			{
				return new AnimalDto
				{
					id = animal.id,
					name = animal.name,
					Adoption_State = animal.Adoption_State.ToString(),
					age = animal.age,
					breed = animal.breed,
					ShelterCategory = new CategoryDto
					{
						CategoryId = animal.ShelterCategory.CategoryId,
						CategoryName = animal.ShelterCategory.CategoryName,
					}
				};
			}
			else
			{
				return res;
			}
		}
		public async Task<bool> RemovePet(AnimalDto p) 
		{
			var res = await _shelterStaffRepository.DeletePet(p.id);
			if (res > 0)
			{
				return true;
			}
			return false;
		}

		public async Task<IEnumerable<AdoptionRequestDto>> ListAdoptionRequests(int shelterID)
		{
			var res = await _shelterStaffRepository.ListAdoptionRequests(shelterID);
			List<AdoptionRequestDto> adoptionRequestDtos = new List<AdoptionRequestDto>();
			if (res != null)
			{
				res.ToList().ForEach(request =>
				{
					adoptionRequestDtos.Add(new AdoptionRequestDto
					{
						requestId = request.Id,
						Adopter = new AdopterDto
						{
							Id = request.Adopter.Id,
							Uname = request.Adopter.Uname,
						},
						Animal = new AnimalDto
						{
							id = request.Pet.id,
							name = request.Pet.name,
						},
						Status = ((AdoptionRequest.AdoptionRequestStatus)request.Status).ToString(),
					});
				});
				return adoptionRequestDtos;
			}
			else
			{
				return null;
			}
		}

		public async Task<int> ApproveAdoptionRequest(int id)
		{
			if (id != 0)
			{
				return await _shelterStaffRepository.ApproveAdoptionRequest(id);
			}
			return -2;//something went wrong id is set to 0
		}
	}
}
