using System.ComponentModel;
using System.Diagnostics.Eventing.Reader;
using Microsoft.EntityFrameworkCore;
using PetShelter.Data;
using PetShelter.DTOs;
using PetShelter.Models;

namespace PetShelter.Repository
{
	public class ShelterStaffRepository
	{
		private readonly Db_Context _context;

		public ShelterStaffRepository(Db_Context context)
		{
			_context = context ?? throw new ArgumentNullException(nameof(context));
		}

		public async Task<object> listCategories(int shelter_FK)
		{
			if (shelter_FK != 1)
			{
				IEnumerable<ShelterCategory>  categories = await _context.Categories.Where(c=>c.Shelter_FK == shelter_FK).ToListAsync();
				IEnumerable<Shelter> shelters = await _context.Shelters.ToListAsync();
				if (categories.Count() != 0)
				{
					categories.ToList().ForEach(cat =>
					{
						cat.Shelter = shelters.FirstOrDefault(s => s.ShelterID == cat.Shelter_FK);
					});
				}
				return categories;
			}
            else
            {
				return -1; //not assigned to a shelter at the moment
			}
        }

		//public async Task<IEnumerable<AnimalDto>> ListPets(int ? CatId = 0, int? ShelterID = 0)
		//{
		//	IEnumerable<Animal> animals;
		//	if (CatId != 0 || ShelterID !=0)
		//	{
		//		animals = await _context.Animals.Where(a => a.Category_FK == CatId || a.Shelter_FK == ShelterID).ToListAsync();
		//	}
		//	else
		//	{
		//		animals = await _context.Animals.ToListAsync();
		//	}
		//	List<ShelterCategory> categories = await _context.Categories.ToListAsync();
		//	List<Shelter> shelters = await _context.Shelters.ToListAsync();
		//	List<AnimalDto> animalDtos = new List<AnimalDto>();
		//	animals.ToList().ForEach(async animal =>
		//	{
		//		ShelterCategory Cat = categories.FirstOrDefault(c => c.CategoryId == animal.Category_FK);
		//		Shelter Shelter = shelters.FirstOrDefault(s => s.ShelterID == Cat.Shelter_FK);
		//		animalDtos.Add(new AnimalDto
		//		{
		//			id = animal.id,
		//			name = animal.name,
		//			Adoption_State = ((Animal.AdoptionState)animal.Adoption_State).ToString(),
		//			age = animal.age,
		//			breed = animal.breed,
		//			ShelterCategory = Cat,
		//			shelterDto = new ShelterDto
		//			{
		//				ShelterId = Shelter.ShelterID,
		//				ShelterName = Shelter.ShelterName,
		//				ShelterLocation = Shelter.Location,
		//				ShelterPhone = Shelter.Phone,
		//			}
		//		});
		//	});
		//	if (animalDtos.Count() == 0)
		//	{
		//		return null;//not found
		//	}
		//	else
		//	{
		//		return animalDtos;
		//	}
		//}


		//public async Task<IEnumerable<Animal>> ListPets(int? CatId = 0, int? ShelterID = 0,string? catname = "")
		//{
		//	IEnumerable<Animal> animals;
		//	List<ShelterCategory> categories;
		//	if (CatId != 0 || ShelterID != 0)
		//	{
		//		animals = await _context.Animals.Include(a=>a.ShelterCategory).Where(a => a.Category_FK == CatId || a.Shelter_FK == ShelterID).ToListAsync();
		//	}
		//	else if(catname != "")
		//	{
		//		categories = await _context.Categories.Where(c => c.CategoryName.ToLower().Contains(catname.ToLower())).ToListAsync();
		//		//animals = await _context.Animals.Where(a => a.Category_FK == ca).ToListAsync();
		//	}
		//	else
		//	{
		//		animals = await _context.Animals.ToListAsync();
		//	}
		//	categories = await _context.Categories.ToListAsync();
		//	List<Shelter> shelters = await _context.Shelters.ToListAsync();
		//	//List<AnimalDto> animalDtos = new List<AnimalDto>();
		//	animals.ToList().ForEach(async animal =>
		//	{
		//		ShelterCategory Cat = categories.FirstOrDefault(c => c.CategoryId == animal.Category_FK);
		//		Shelter Shelter = shelters.FirstOrDefault(s => s.ShelterID == Cat.Shelter_FK);
		//	});
		//	if (animals.Count() == 0)
		//	{
		//		return null;//not found
		//	}
		//	else
		//	{
		//		return animals;
		//	}
		//}


		//public async Task<IEnumerable<Animal>> ListPets(int? CatId = 0, int? ShelterID = 0, string? catname = "")
		//{
		//	IEnumerable<Animal> animals;
		//	List<ShelterCategory> categories = new List<ShelterCategory>();
		//	List<Shelter> shelters = new List<Shelter>();

		//	// Handle the case where we have either CatId or ShelterID
		//	if (CatId != 0 || ShelterID != 0)
		//	{
		//		animals = await _context.Animals
		//			.Include(a => a.ShelterCategory)
		//			.Where(a => a.Category_FK == CatId || a.Shelter_FK == ShelterID)
		//			.ToListAsync();
		//	}
		//	// Handle the case where we want to filter by category name
		//	else if (!string.IsNullOrEmpty(catname))
		//	{
		//		categories = await _context.Categories
		//			.Where(c => c.CategoryName.ToLower().Contains(catname.ToLower()))
		//			.ToListAsync();

		//		var categoryIds = categories.Select(c => c.CategoryId).ToList();
		//		animals = await _context.Animals
		//			.Where(a => categoryIds.Contains(a.Category_FK))
		//			.ToListAsync();
		//	}
		//	else
		//	{
		//		animals = await _context.Animals.ToListAsync();
		//	}

		//	// Fetch shelters only once, as we need them for every animal
		//	shelters = await _context.Shelters.ToListAsync();

		//	// Dictionary for fast lookup of categories by CategoryId
		//	var categoryDict = categories.ToDictionary(c => c.CategoryId, c => c);

		//	// Dictionary for fast lookup of shelters by ShelterID
		//	var shelterDict = shelters.ToDictionary(s => s.ShelterID, s => s);

		//	// Map each animal to its category and shelter, if applicable
		//	foreach (var animal in animals)
		//	{
		//		// Find the category and shelter (if available)
		//		if (categoryDict.TryGetValue(animal.Category_FK, out var category))
		//		{
		//			animal.ShelterCategory = category;

		//			if (shelterDict.TryGetValue(category.Shelter_FK, out var shelter))
		//			{
		//				animal.Shelter = shelter;
		//			}
		//		}
		//	}

		//	// Return animals if any exist, otherwise return null
		//	return animals.Any() ? animals : null;
		//}


		public async Task<IEnumerable<Animal>> ListPets(int? CatId = 0, int? ShelterID = 0, string? catname = "")
		{
			IEnumerable<Animal> animals;
			List<ShelterCategory> categories = null;
			List<Shelter> shelters = null;

			// Handle the case where we have either CatId or ShelterID
			if (CatId != 0)
			{
				animals = await _context.Animals
					.Include(a => a.ShelterCategory)
					.Include(a=>a.Shelter)
					.Where(a => a.Category_FK == CatId)
					.ToListAsync();
			}
			else if(ShelterID != 0)
			{
				animals = await _context.Animals
					.Include(a => a.ShelterCategory)
					.Include(a => a.Shelter)
					.Where(a => a.Shelter_FK == ShelterID)
					.ToListAsync();
			}
			// Handle the case where we want to filter by category name
			else if (!string.IsNullOrEmpty(catname))
			{
				categories = await _context.Categories
					.Where(c => c.CategoryName.ToLower().Contains(catname.ToLower()))
					.ToListAsync();

				var categoryIds = categories.Select(c => c.CategoryId).ToList();
				animals = await _context.Animals
					.Where(a => categoryIds.Contains(a.Category_FK)&& a.Adoption_State != 0)
					.Include(c=>c.ShelterCategory)
					.Include(s=>s.Shelter)
					.ToListAsync();
			}
			else
			{
				animals = await _context.Animals.Where(a=>a.Adoption_State != 0).Include(c=>c.ShelterCategory).Include(s=>s.Shelter).ToListAsync();
			}
			// Return animals if any exist, otherwise return null
			return animals.Any() ? animals : null;
		}


		//adding animals

		public async Task<bool> CategoryExistence(int CatId)
		{
			if (await _context.Categories.FirstOrDefaultAsync(c => c.CategoryId == CatId) != null)
			{
				return true;
			}
			else
				return false;
		}

		public async Task<object> AddPet(Animal animal)
		{
			if(animal != null)
			{
				ShelterCategory category = await _context.Categories.FirstOrDefaultAsync(c=>c.CategoryId==animal.Category_FK);
				animal.Adoption_State = 2;
				animal.Shelter_FK = category.Shelter_FK;
				await _context.Animals.AddAsync(animal);
				await _context.SaveChangesAsync();
				return animal;
			}
			else
				return 0;
		}

		public async Task<Animal> ViewPet(int id)
		{
			Animal a = await _context.Animals.FirstOrDefaultAsync(a=>a.id== id);
			if (a != null)
			{
				ShelterCategory Cat = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryId == a.Category_FK);
				Shelter Shelter = await _context.Shelters.FirstOrDefaultAsync(s => s.ShelterID == Cat.Shelter_FK);
				a.ShelterCategory = Cat;
				a.Shelter = Shelter;
				return a;
			}
			else
				return null;
		}

		public async Task<int> UpdatePet(Animal animal)
		{
			if (animal != null)
			{
				Animal a = await _context.Animals.FirstOrDefaultAsync(A => A.id == animal.id);
				if (a == null)
					return -2; //animal not found
				a.name = animal.name;
				a.age = animal.age;
				a.breed = animal.breed;
				a.Adoption_State =animal.Adoption_State;
				a.medication_history = animal.medication_history;
				a.Category_FK = animal.Category_FK;
				a.ShelterCategory = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryId == animal.Category_FK);
				_context.Animals.Update(a);
				int res = await _context.SaveChangesAsync();
				return res;
			}
			else
			{
				return -1;//something went wrong
			}
		}
		public async Task<int> DeletePet(int id)
		{
			if (id != 0)
			{
				Animal a = await _context.Animals.FirstOrDefaultAsync(a => a.id == id);
				_context.Animals.Remove(a);
				int res = await _context.SaveChangesAsync();
				return res;
			}
			else
			{
				return 0; //something went wrong
			}
		}

		public async Task<IEnumerable<AdoptionRequest>> ListAdoptionRequests(int shelterID)
		{
			IEnumerable<AdoptionRequest> requests = await _context.AdoptionRequest.Include(ar=>ar.Shelter).Include(ar => ar.Adopter).Include(ar => ar.Pet).ToListAsync();
			if(requests.Count()!=0)
			{
				return requests;
			}
			else
			{
				return null;
			}
		}

		//update

		public async Task<int> ApproveAdoptionRequest(int Rid)
		{
			AdoptionRequest adoption = await _context.AdoptionRequest.FirstOrDefaultAsync(a => a.Id == Rid);
			if (adoption != null)
			{
				List<AdoptionRequest> requests = await _context.AdoptionRequest.Where(a => a.PetId_FK == adoption.PetId_FK).ToListAsync();
				if (requests.Count() > 1)
				{
					foreach (var request in requests)
					{
						if (request.Id != Rid)
						{
							request.Status = AdoptionRequest.AdoptionRequestStatus.Rejected;
							//_context.AdoptionRequest.Update(request);
						}
					}
				}
				adoption.Status = AdoptionRequest.AdoptionRequestStatus.Approved;
				adoption.Approved_At = DateTime.Now;
				//_context.AdoptionRequest.Update(adoption);
				int res = await _context.SaveChangesAsync();
				return res > 0 ? res : 0; 
			}
			else
				return -1;//not found
		}

		public async Task<DateOnly> DayAvailability(DateOnly Requestdate)
		{
			DateOnly Idate = Requestdate.AddDays(5);

			while (await _context.Interviews.Where(i=>i.InterviewDate == Idate).CountAsync() >5)
			{
				Idate = Idate.AddDays(1);
			}
			return Idate;
		}


		//public async Task<int> AutomaticScheduleInterview(int Rid)
		//{
		//	var res = await _context.AdoptionRequest.Include(ar => ar.Adopter).FirstOrDefaultAsync(a => a.Id == Rid);
		//	if (res != null)
		//	{
		//		DateOnly Idate = await DayAvailability(DateOnly.FromDateTime(res.RequestDate));
		//		Interview interview = new Interview
		//		{
		//			AdoptionRequest_fk = Rid,
		//			InterviewDate = Idate,
		//			AdoptionRequest = new AdoptionRequest
		//			{
		//				Id = res.Id,
		//				RequestDate = res.RequestDate,
		//				Adopter = new Adopter
		//				{
		//					Id = res.Adopter.Id,
		//					Uname = res.Adopter.Uname,
		//					Phone = res.Adopter.Phone,
		//					Email = res.Adopter.Email
		//				}
		//			}
		//		};
		//		await _context.Interviews.AddAsync(interview);
		//		return await _context.SaveChangesAsync();	
		//	}
		//	else
		//		return -1; //adoption request doesn't exist
		//}
		public async Task<int> AutomaticScheduleInterview(int Rid)
		{
			var res = await _context.AdoptionRequest.Include(ar => ar.Adopter).FirstOrDefaultAsync(a => a.Id == Rid);
			if (res != null)
			{
				DateOnly Idate = await DayAvailability(DateOnly.FromDateTime(res.RequestDate));
				Interview interview = new Interview
				{
					AdoptionRequest_fk = Rid,
					InterviewDate = Idate
					// Don't create a new AdoptionRequest, it's already tracked
				};
				await _context.Interviews.AddAsync(interview);
				return await _context.SaveChangesAsync();
			}
			else
				return -1; //adoption request doesn't exist
		}
	}
}
