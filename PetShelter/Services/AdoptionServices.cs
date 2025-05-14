using Microsoft.AspNetCore.Mvc;
using PetShelter.DTOs;
using PetShelter.Models;
using PetShelter.Repository;
using Microsoft.AspNetCore.SignalR;
using PetShelter.Hubs;

namespace PetShelter.Services
{
	public class AdoptionServices : BaseService
	{
		private readonly AdoptionRepository _adoptionRepository;
		private readonly AdminServices _adminServices;

		public AdoptionServices(
			AdoptionRepository adoptionRepository, 
			IHubContext<DashboardHub> hubContext,
			AdminServices adminServices)
			: base(hubContext)
		{
			_adoptionRepository = adoptionRepository ?? throw new ArgumentNullException(nameof(adoptionRepository));
			_adminServices = adminServices ?? throw new ArgumentNullException(nameof(adminServices));
		}

		public async Task<IEnumerable<AnimalDto>> ListPets(string? catname ="",int ? Uid = 0)//done
		{
			IEnumerable<Animal> animals = await _adoptionRepository.ListPets(0,0,catname,Uid);
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
					var result = await _adoptionRepository.Adopt(adoption);
					if (result > 0)
					{
						var stats = await _adminServices.GetDashboardStats();
						await NotifyDashboardUpdate(stats);
					}
					return result;
				}
			}
			else
				return -1;// something went wrong
		}

        /////////////////
        public async Task<object> AdoptionHistory(int id)
        {
            if (id != 0)
            {
                IEnumerable<AdoptionRequest> res = await _adoptionRepository.AdoptionHistory(id);
                List<AdoptionRequestDto> adoptionRequestDtos = new List<AdoptionRequestDto>();
                foreach(AdoptionRequest adoption in res)
                {
                    //Console.WriteLine(adoption.ToString());
                    InterviewDto interview = null;
                    if (adoption.Status == AdoptionRequest.AdoptionRequestStatus.Approved)
                    {
                        var interviews = await ListInterviews(adoption.Id);
                        if (interviews is InterviewDto interviewDto)
                            interview = interviewDto;
                    }
                    adoptionRequestDtos.Add(new AdoptionRequestDto
                    {
                        requestId = adoption.Id,
                        Animal = new AnimalDto
                        {
                            id = adoption.Pet.id,
                            name = adoption.Pet.name,
                        },
                        interviewDto = interview,
                        Status = ((AdoptionRequest.AdoptionRequestStatus)adoption.Status).ToString(),
                        RequestDate = adoption.RequestDate,
                        Approved_At = adoption.Approved_At,
                        Shelter = new ShelterDto
                        {
                            ShelterId = adoption.Shelter.ShelterID,
                            ShelterName = adoption.Shelter.ShelterName
                        }
                    });
                }
                if (adoptionRequestDtos == null || !adoptionRequestDtos.Any())
                {
                    return null; //nothing was found
                }
                else
                {
                    return adoptionRequestDtos;
                }
            }
            return null;//something went wrong
        }

        public async Task<object> ListInterviews(int Rid)
        {
			if (Rid != 0)
			{
				var res = await _adoptionRepository.getInterview(Rid, 0);
				if (res is Interview interview)
				{
					return new InterviewDto
					{
						id = interview.id,
						InterviewDate = interview.InterviewDate
					};
				}
				return res;

			}
			else
				return -1;
        }
        ///////////////////////////

        //public async Task<object> AdoptionHistory(int id)
        //{
        //    if(id != 0)
        //    {
        //        IEnumerable<AdoptionRequest> res = await _adoptionRepository.AdoptionHistory(id);
        //        List<AdoptionRequestDto> adoptionRequestDtos = new List<AdoptionRequestDto>();

        //        res.ToList().ForEach(adoption =>
        //        {
        //            if (adoption != null)
        //            {
        //                // Print detailed information of each adoption
        //                Console.WriteLine($"Adoption ID: {adoption.Id}");
        //                Console.WriteLine($"Pet ID: {adoption.Pet?.id}");
        //                Console.WriteLine($"Pet Name: {adoption.Pet?.name}");
        //                Console.WriteLine($"Status: {(AdoptionRequest.AdoptionRequestStatus)adoption.Status}");
        //                Console.WriteLine($"Request Date: {adoption.RequestDate}");
        //                Console.WriteLine($"Approved At: {adoption.Approved_At}");
        //                Console.WriteLine($"Shelter ID: {adoption.Shelter?.ShelterID}");
        //                Console.WriteLine($"Shelter Name: {adoption.Shelter?.ShelterName}");
        //                Console.WriteLine("-------------");

        //                // Optionally, add to the DTO list
        //                adoptionRequestDtos.Add(new AdoptionRequestDto
        //                {
        //                    requestId = adoption.Id,
        //                    Animal = new AnimalDto
        //                    {
        //                        id = adoption.Pet?.id ?? 0, // Default to 0 if Pet is null
        //                        name = adoption.Pet?.name ?? "Unknown",
        //                    },
        //                    Status = ((AdoptionRequest.AdoptionRequestStatus)adoption.Status).ToString(),
        //                    RequestDate = adoption.RequestDate,
        //                    Approved_At = adoption.Approved_At,
        //                    Shelter = new ShelterDto
        //                    {
        //                        ShelterId = adoption.Shelter?.ShelterID ?? 0,
        //                        ShelterName = adoption.Shelter?.ShelterName ?? "Unknown",
        //                    }
        //                });
        //            }
        //        });

        //        if (adoptionRequestDtos == null || !adoptionRequestDtos.Any())
        //        {
        //            return null; // nothing was found
        //        }
        //        else
        //        {
        //            return adoptionRequestDtos;
        //        }
        //    }
        //    return null; // something went wrong
        //}


        public async Task<object> ViewAdoption(int id)
		{
			if (id != 0)
			{
				var res = await _adoptionRepository.ViewAdoption(id);
				if (res == null)
				{
					return 0; //nothing was found
				}
				else
				{
					return new AdoptionRequestDto
					{
						Adopter = new AdopterDto
						{
							Id = res.AdopterId_FK,
							Uname = res.Adopter.Uname,
						},
						Animal = new AnimalDto
						{
							id = res.Pet.id,
							name = res.Pet.name,
						},
						Status = ((AdoptionRequest.AdoptionRequestStatus)res.Status).ToString(),
						Approved_At = res.Approved_At
					};
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
			if(id != 0)
			{
				var res = await _adoptionRepository.ShowPet(id);
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
	}
}
