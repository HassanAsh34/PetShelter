using System.ComponentModel;
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

		public async Task<IEnumerable<ShelterCategory>> listCategories()
		{
			return await _context.Categories.ToListAsync();
		}

		public async Task<IEnumerable<Animal>> ListPets(int ? CatId = 0)
		{
			if (CatId != 0)
			{
				return await _context.Animals.Where(a => a.CategoryID == CatId).ToListAsync();
			}
			else
				return await _context.Animals.ToListAsync();
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

		public async Task<int> AddPet(Animal animal)
		{
			if(animal != null)
			{
				animal.Adoption_State = 2;
				await _context.Animals.AddAsync(animal);
				int res = _context.SaveChanges();
				return res;
			}
			else
				return 0;
		}

		public async Task<Animal> ViewPet(int id)
		{
			return await _context.Animals.FirstOrDefaultAsync(a=>a.id== id);
		}

		public async Task<int> DeletePet(AnimalDto animal)
		{
			if (animal != null)
			{
				Animal a = await _context.Animals.FirstOrDefaultAsync(a => a.id == animal.id);
				_context.Animals.Remove(a);
				int res = _context.SaveChanges();
				return res;
			}
			else
			{
				return 0;
			}
		}

		//update
	}
}
