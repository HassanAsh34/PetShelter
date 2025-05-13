using System.Linq;
using Microsoft.EntityFrameworkCore;
using PetShelter.Data;
using PetShelter.DTOs;
using PetShelter.Models;

namespace PetShelter.Repository
{
    public class ShelterRepository
    {
        private readonly Db_Context _context;

        public ShelterRepository(Db_Context context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }
        public async Task<List<ShelterCategory>> ListShelterCategories(int? id = 0, CategoryDto? category = null)
        {
            List<ShelterCategory> shelterCategories = new List<ShelterCategory>();
            if (id != 0)
            {
                shelterCategories = await _context.Categories.Include(c => c.Shelter).Include(c => c.Animal).Where(c => !c.CategoryName.ToLower().Contains("unset") && (c.Shelter_FK == id)).ToListAsync();
            }
            return shelterCategories;
        }

        //public async Task<ShelterCategory> GetCategories(ShelterCategory Category)
        //{
        //	ShelterCategory category = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryName.ToLower().Equals(Category.CategoryName.ToLower()));
        //}

        //categories
        public async Task<object> addCategory(ShelterCategory shelterCategory)
        {
            if (await ShelterExistence(new Shelter() { ShelterID = shelterCategory.Shelter_FK }) == false)
            {
                return -1; //indicates that the shelter does not exist
            }
            var res = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryName.ToLower().Contains(shelterCategory.CategoryName.ToLower()) && c.Shelter_FK == shelterCategory.Shelter_FK);
            if (res == null)
            {
                await _context.Categories.AddAsync(shelterCategory);
                await _context.SaveChangesAsync();
                return shelterCategory;
            }
            else
                return 0; //which means that category exists
        }
        public async Task<int> EditCategory(ShelterCategory category)
        {
            ShelterCategory shelterCategory = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryId == category.CategoryId);
            if (shelterCategory == null)
            {
                return -1; //incase not found
            }
            else
            {
                //shelterCategory.CategoryDescription = category.CategoryDescription;
                shelterCategory.CategoryName = category.CategoryName;
                return await _context.SaveChangesAsync(); // number of records changed 
            }
        }

        //private async 


        //shelter
        private async Task<bool> ShelterExistence(Shelter shelter)
        {
            var res = await _context.Shelters.FirstOrDefaultAsync(a => a.ShelterName.ToLower() == (shelter.ShelterName != null ? shelter.ShelterName.ToLower() : "") || a.ShelterID == shelter.ShelterID);
            if (res != null)
            {
                return true;
            }
            else
                return false;
        }
        public async Task<object> AddShelter(Shelter shelter)
        {
            if (shelter != null)
            {
                if (await ShelterExistence(shelter) == true)
                {
                    return false; //indicates that the shelter already exists
                }
                else
                {
                    Shelter s = _context.Shelters.Add(shelter).Entity;
                    await _context.SaveChangesAsync();
                    ShelterCategory category = new ShelterCategory()
                    {
                        Shelter_FK = shelter.ShelterID,
                        CategoryName = $"{shelter.ShelterName}-Unset"

                    };
                    _context.Add(category);
                    await _context.SaveChangesAsync();
                    return shelter;
                }
            }
            else
                return null;// something went wrong
        }

        public async Task<int> AssignToShelter(StaffDto staff)
        {
            if (await ShelterExistence(new Shelter() { ShelterID = staff.Shelter_FK }) == false)
            {
                return -2; //indicates that the shelter does not exist
            }
            ShelterStaff s = await _context.Staff.FirstOrDefaultAsync(s => s.Id == staff.Id);
            if (s != null)
            {
                s.Shelter_FK = staff.Shelter_FK;
                s.HiredDate = DateOnly.FromDateTime(DateTime.Now);
                return await _context.SaveChangesAsync();
            }
            else
                return -1;//indicates that the staff does not exist
        }

        public async Task<object> ShowShelter(int? id = 0)
        {
            if (id != 0)
            {
                Shelter shelter = await _context.Shelters
                    .Include(s => s.Staff)
                    .Include(s => s.Category)
                    .FirstOrDefaultAsync(s => s.ShelterID == id);
                if (shelter != null)
                {
                    return shelter;
                }
                else
                    return null; //indicates that the shelter does not exist
            }
            else
            {
                return await _context.Shelters.Where(s => !s.ShelterName.ToLower().Contains("deleted") && !s.ShelterName.ToLower().Contains("unassigned"))
                    .Include(s => s.Staff)
                    .Include(s => s.Category)
                    .ToListAsync();
            }
        }



        //public async Task<IEnumerable<Shelter>> ListShelters()
        //{
        //	return await _context.Shelters.ToListAsync();
        //}




        public async Task<int> DeleteShelter(ShelterDto shelter)
        {
            Shelter Shelter = await _context.Shelters.Include(s => s.Staff).Include(s => s.Animals).FirstOrDefaultAsync(s => s.ShelterID == shelter.ShelterId);
            if (Shelter != null)
            {
                List<Animal> animals = Shelter.Animals.ToList();
                Console.WriteLine(animals.Count());
                await ManageAdoptionRequests(animals, Shelter.ShelterID);
                await RemoveStaff(Shelter.Staff.ToList());
                await deleteCategory(null, true, Shelter.ShelterID);
                _context.Remove(Shelter);
                return await _context.SaveChangesAsync();
            }
            else
                return -1; //indicates that the shelter does not exist
        }

        private async Task<bool> RemoveStaff(List<ShelterStaff> staff)
        {
            if (staff != null && staff.Count > 0)
            {
                staff.ForEach(s =>
                {
                    _context.Remove(s);
                });
                return await _context.SaveChangesAsync() > 0;
            }
            return false;
        }

        //private async Task<bool> ManageAdoptionRequests(List<Animal> animals,int ShelterId)
        //{
        //	if(animals.Count > 0)
        //	{
        //		List<AdoptionRequest> adoptionRequests = await _context.AdoptionRequest.Include(a=>a.Pet).Where(a => a.Shelter_FK == ShelterId).ToListAsync();
        //		if (adoptionRequests.Count > 0)
        //		{
        //			ShelterCategory category = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryName.ToLower().Contains("unset"));
        //			Shelter deleted = await _context.Shelters.FirstOrDefaultAsync(s => s.ShelterName.ToLower().Contains("deleted"));
        //			List<Animal> AnimalsWithRequests = animals.Where(animal => adoptionRequests.Any(req => req.Pet == animal)).ToList();
        //			List<Animal> AnimalsWithoutRequests = animals.Where(animal => !adoptionRequests.Any(req => req.Pet == animal)).ToList();
        //			_context.RemoveRange(AnimalsWithoutRequests);
        //			foreach (Animal animal in AnimalsWithRequests)
        //			{
        //				if (animal.Adoption_State == (int)Animal.AdoptionState.Adopted)
        //				{
        //					animal.Shelter_FK = deleted.ShelterID; // Unassigned
        //					animal.Category_FK = category.CategoryId; // Unassigned
        //					adoptionRequests.Where(Animal => Animal.Pet == animal).ToList().ForEach(a =>
        //					{
        //						a.Pet.Shelter_FK = deleted.ShelterID; // Unassigned
        //					});
        //				}
        //				else
        //				{
        //					_context.RemoveRange(adoptionRequests.Where(Animal => Animal.Pet == animal).ToList());
        //					_context.Remove(animal);
        //				}
        //			}
        //		}
        //		else
        //		{
        //			_context.RemoveRange(animals);
        //		}
        //		return await _context.SaveChangesAsync() > 0;
        //	}
        //	return false;
        //}

        private async Task<bool> ManageAdoptionRequests(List<Animal> animals, int ShelterId)
        {
            Console.WriteLine(animals.Count());
            if (animals.Count > 0)
            {
                List<AdoptionRequest> adoptionRequests = await _context.AdoptionRequest
                    .Include(a => a.Pet)
                    .Where(a => a.Shelter_FK == ShelterId)
                    .ToListAsync();

                Console.WriteLine(adoptionRequests);
                Console.WriteLine(animals);

                if (adoptionRequests.Count > 0)
                {
                    Shelter deleted = await _context.Shelters.FirstOrDefaultAsync(s => s.ShelterName.ToLower().Contains("deleted"));
                    ShelterCategory category = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryId == deleted.ShelterID);

                    // Use ID comparison to avoid EF Core tracking issues
                    List<Animal> AnimalsWithRequests = animals
                        .Where(animal => adoptionRequests.Any(req => req.PetId_FK == animal.id))
                        .ToList();

                    List<Animal> AnimalsWithoutRequests = animals
                        .Where(animal => !adoptionRequests.Any(req => req.PetId_FK == animal.id))
                        .ToList();

                    // Delete animals without requests directly
                    _context.RemoveRange(AnimalsWithoutRequests);

                    foreach (Animal animal in AnimalsWithRequests)
                    {
                        if (animal.Adoption_State == (int)Animal.AdoptionState.Adopted)
                        {
                            animal.Shelter_FK = deleted.ShelterID;
                            animal.Category_FK = category.CategoryId;

                            // Update shelter reference for all related adoption requests
                            var relatedRequests = adoptionRequests
                                .Where(req => req.PetId_FK == animal.id)
                                .ToList();

                            foreach (var request in relatedRequests)
                            {
                                request.Shelter_FK = deleted.ShelterID;
                            }
                        }
                        else
                        {
                            // Remove associated adoption requests, then the animal
                            var relatedRequests = adoptionRequests
                                .Where(req => req.PetId_FK == animal.id)
                                .ToList();

                            _context.RemoveRange(relatedRequests);
                            _context.Remove(animal);
                        }
                    }
                }
                else
                {
                    _context.RemoveRange(animals);
                }

                return await _context.SaveChangesAsync() > 0;
            }

            return false;
        }


        public async Task<int> deleteCategory(ShelterCategory? category = null, bool? all = false, int? shelterID = 0)
        {
            if (all == true && shelterID != 0)
            {
                var allCategories = await _context.Categories.Where(c => c.Shelter_FK == shelterID).ToListAsync();
                if (allCategories.Any())
                {
                    _context.Categories.RemoveRange(allCategories);
                    return await _context.SaveChangesAsync();
                }
                return 0; // nothing to delete
            }

            if (category != null)
            {
                ShelterCategory res = await _context.Categories.Include(c => c.Animal).Include(c => c.Shelter).FirstOrDefaultAsync(c => c.CategoryId == category.CategoryId);

                if (res != null)
                {
                    List<Animal> animals = res.Animal;
                    Shelter shelter = res.Shelter;
                    ShelterCategory cat = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryName.ToLower().Contains($"{shelter.ShelterName}-Unset"));
                    animals.ForEach(async a =>
                    {
                        if (a.Adoption_State == (int)Animal.AdoptionState.Adopted)
                        {
                            //a.Shelter_FK = deleted.ShelterID;
                            a.Category_FK = cat.CategoryId;
                        }
                        else
                        {
                            _context.RemoveRange(await _context.AdoptionRequest.Where(r => r.PetId_FK == a.id).ToListAsync());
                            _context.Remove(a);
                        }
                    });
                    _context.Categories.Remove(res);
                    return await _context.SaveChangesAsync();
                }
            }

            return -1; // category not found
        }

        public async Task<int> UnassignFromShelter(int id)
        {
            List<ShelterStaff> s = await _context.Staff.Where(s => s.Shelter_FK == id).ToListAsync();
            s.ForEach(staff =>
            {
                staff.Shelter_FK = 1;
            });
            return await _context.SaveChangesAsync();
            //else
            //	return -1; //indicates that there is no staff in that shelter
        }
    }
}
