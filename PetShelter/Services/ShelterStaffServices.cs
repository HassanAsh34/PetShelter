using PetShelter.DTOs;
using PetShelter.Models;
using PetShelter.Repository;
using Microsoft.AspNetCore.SignalR;
using PetShelter.Hubs;

namespace PetShelter.Services
{
	public class ShelterStaffServices : BaseService
	{
		private readonly ShelterStaffRepository _shelterStaffRepository;
		private readonly AdminServices _adminServices;

		public ShelterStaffServices(
			ShelterStaffRepository shelterStaffRepository, 
			IHubContext<DashboardHub> hubContext,
			AdminServices adminServices)
			: base(hubContext)
		{
			_shelterStaffRepository = shelterStaffRepository ?? throw new ArgumentNullException(nameof(shelterStaffRepository));
			_adminServices = adminServices ?? throw new ArgumentNullException(nameof(adminServices));
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
		public async Task<object> AddPet(Animal animal)
		{
			if (await _shelterStaffRepository.CategoryExistence(animal.Category_FK) == true)
			{
				var res = await _shelterStaffRepository.AddPet(animal);
				if (res is Animal a)
				{
					var stats = await _adminServices.GetDashboardStats();
					await NotifyDashboardUpdate(stats);
					return new AnimalDto
					{
						id = a.id,
						name = a.name,
						Adoption_State = ((Animal.AdoptionState)a.Adoption_State).ToString(),
						age = a.age,
						breed = a.breed,
						ShelterCategory = new CategoryDto
						{
							CategoryId = a.ShelterCategory.CategoryId,
							CategoryName = a.ShelterCategory.CategoryName,
						}
					};
				}
				else
					return -1;
			}
			else
				return 0;
		}

		public async Task<object> ViewPet(int id) //edit here
		{
			if (id != 0)
			{
				var res = await _shelterStaffRepository.ViewPet(id);
				if (res is Animal a)
				{
					return new AnimalDto
					{
						id = a.id,
						name = a.name,
						Adoption_State = ((Animal.AdoptionState)a.Adoption_State).ToString(),
						age = a.age,
						breed = a.breed,
						ShelterCategory = new CategoryDto
						{
							CategoryId = a.ShelterCategory.CategoryId,
							CategoryName = a.ShelterCategory.CategoryName,
						},
						shelterDto = new ShelterDto
						{
							ShelterId = a.Shelter.ShelterID,
							ShelterName = a.Shelter.ShelterName,
							ShelterLocation = a.Shelter.Location,
							ShelterPhone = a.Shelter.Phone,
						}
					};
				}
				else
					return null;
			}
			return -1;//something went wrong
		}


		public async Task<object> UpdatePet(Animal animal)
		{
			if (await _shelterStaffRepository.CategoryExistence(animal.Category_FK) == false)
			{
				return -3; // category not found
			}
			var res = await _shelterStaffRepository.UpdatePet(animal);
			if (res is Animal a)
			{
				var stats = await _adminServices.GetDashboardStats();
				await NotifyDashboardUpdate(stats);
				return new AnimalDto
				{
					id = a.id,
					name = a.name,
					Adoption_State = a.Adoption_State.ToString(),
					age = a.age,
					breed = a.breed,
					//ShelterCategory = new CategoryDto
					//{
					//	CategoryId = animal.ShelterCategory.CategoryId,
					//	CategoryName = animal.ShelterCategory.CategoryName,
					//}
				};
			}
			else
			{
				return res;
			}
		}
        //done//
        public async Task<int> RemovePet(int id)
        {
            var res = await _shelterStaffRepository.DeletePet(id);
            if (res > 0)
            {
                var stats = await _adminServices.GetDashboardStats();
                await NotifyDashboardUpdate(stats);
            }
            return res;
        }
        //


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
				var res = await _shelterStaffRepository.ApproveAdoptionRequest(id);
				if(res > 0)
				{
					bool schedule = await AutomaticScheduleInterview(id);
					if (schedule == true)
					{
						return res; //adoption request approved and interview scheduled
					}
					else
						//add a part if interview is not scheduled cancel adoption approval 
						return -3; //interview not scheduled 

				}
				else
					return -1; //adoption request not approved
			}
			return -2;//something went wrong id is set to 0
		}

        public async Task<bool> RejectAdoptionRequest(int Rid)
        {
            if (Rid != 0)
            {
                var res = await _shelterStaffRepository.RejectAdoptionRequest(Rid);
                if (res > 0)
                {
                    return true;
                }
                else
                    return false; //adoption request not rejected
            }
            else
                return false; //request id is set to 0
        }

        private async Task<bool> AutomaticScheduleInterview(int Rid)
		{
			//if (Rid != 0)
			//{
				var res = await _shelterStaffRepository.AutomaticScheduleInterview(Rid);
				if (res > 0)
				{
					return true;
				}
				else
					return false; //interview not scheduled
			//}
			//else
			//	return -2; //request id is set to 0

		}
	}
}
