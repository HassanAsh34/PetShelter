using Microsoft.EntityFrameworkCore;
using PetShelter.Data;
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
		public async Task<IEnumerable<Animal>> ListPets(int? CatId = 0)
		{
			return await  _shelterRepository.ListPets(CatId);
		}

		public async Task<object> Adopt(AdoptionRequest adoption)
		{
			if (adoption != null)
			{
				adoption.Status = AdoptionRequest.AdoptionRequestStatus.Pending;
				adoption.RequestDate = DateTime.Now;
				//await _context.AdoptionRequests.AddAsync(adoption);
				int res = await _context.SaveChangesAsync();
				if (res > 0)
				{
					return adoption;
				}
				else
					return 0;// adoption failed
			}
			else
				return -1; //something went wrong
		}

		public async Task<IEnumerable<AdoptionRequest>> AdoptionHistory(int Aid)
		{
			return await _context.AdoptionRequests.Where(a => a.AdopterId == Aid).ToListAsync();
		}

		/*public async Task<AdoptionRequest> ViewAdoption(int id)
		{
			return await _context.AdoptionRequests.FirstOrDefaultAsync(a => a.PetId == id);
		}*/

		public async Task<bool> CancelAdoption(int id)
		{
			var adoption = await _context.AdoptionRequests.FirstOrDefaultAsync(a => a.PetId == id);
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
