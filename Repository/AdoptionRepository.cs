using Microsoft.EntityFrameworkCore;
using PetShelter.Data;
using PetShelter.DTOs;
using PetShelter.Models;

namespace PetShelter.Repository
{
	public class AdoptionRepository
	{
		private readonly Db_Context _context;

		private readonly ShelterStaffRepository _shelterRepository;

		private readonly ShelterStaffRepository _shelterStaffRepository;
		public AdoptionRepository(Db_Context context, ShelterStaffRepository shelterRepository,ShelterStaffRepository shelterStaffRepository)
		{
			_context = context ?? throw new ArgumentNullException(nameof(context));
			_shelterRepository = shelterRepository ?? throw new ArgumentNullException(nameof(shelterRepository));
			_shelterStaffRepository = shelterStaffRepository ?? throw new ArgumentNullException(nameof(shelterStaffRepository));
		}
		public async Task<IEnumerable<Animal>> ListPets(int? CatId = 0, int? ShelterID = 0,string? catname = "")
		{
			return await  _shelterRepository.ListPets(CatId,ShelterID,catname);
		}

		public async Task<bool> RequestExistence(AdoptionRequest adoption)
		{
			var res = await _context.AdoptionRequest.FirstOrDefaultAsync(a => a.PetId_FK == adoption.PetId_FK && a.AdopterId_FK == adoption.AdopterId_FK);
			if (res != null)
			{
				return true;
			}
			else
				return false;// request exist
		}

		public async Task<int> Adopt(AdoptionRequest adoption)
		{
			adoption.Status = AdoptionRequest.AdoptionRequestStatus.Pending;
			adoption.RequestDate = DateTime.Now;
			await _context.AdoptionRequest.AddAsync(adoption);
			int res = await _context.SaveChangesAsync();
			if (res > 0)
			{
				return res;
			}
			else
				return -1;// adoption failed
		}

		public async Task<IEnumerable<AdoptionRequest>> AdoptionHistory(int Aid)
		{
			return await _context.AdoptionRequest.Include(a => a.Pet).Include(a=>a.Adopter)  // Eager load the Pet details
			.Where(a => a.AdopterId_FK == Aid)
			.ToListAsync();
		}

		/*public async Task<AdoptionRequest> ViewAdoption(int id)
		{
			return await _context.AdoptionRequests.FirstOrDefaultAsync(a => a.PetId == id);
		}*/

		public async Task<bool> CancelAdoption(int id)
		{
			var adoption = await _context.AdoptionRequest.FirstOrDefaultAsync(a => a.Id == id);
			if (adoption != null)
			{
				adoption.Status = AdoptionRequest.AdoptionRequestStatus.Rejected;
				int res = await _context.SaveChangesAsync();
				if (res > 0)
					return true;
				else
					return false;
			}
			else
				return false;
		}

		public async Task<object> ShowPet(int id)
		{
			if (id != 0)
			{
				var res = await _shelterStaffRepository.ViewPet(id);
				if (res == null)
				{
					return 0; //nothing was found
				}
				else
				{
					return res;
				}
			}
			return -1;//something went wrong
		}

	}

}
