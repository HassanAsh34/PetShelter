using Microsoft.EntityFrameworkCore;
using PetShelter.Data;
using PetShelter.Models;

namespace PetShelter.Repository
{
	public class AdoptionRepository
	{
		private readonly Db_Context _context;

		private readonly ShelterStaffRepository _shelterRepository;
		public AdoptionRepository(Db_Context context, ShelterStaffRepository shelterRepository)
		{
			_context = context ?? throw new ArgumentNullException(nameof(context));
			_shelterRepository = shelterRepository ?? throw new ArgumentNullException(nameof(shelterRepository));
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
	}

}
