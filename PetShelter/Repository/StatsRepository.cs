using System.Linq;
using Microsoft.EntityFrameworkCore;
using PetShelter.Data;
using PetShelter.DTOs;
using PetShelter.Models;

namespace PetShelter.Repository
{
	public class StatsRepository
	{
		private readonly Db_Context _context;

		public StatsRepository(Db_Context context)
		{
			_context = context ?? throw new ArgumentNullException(nameof(context));
		}

		private async Task<List<Shelter>> Shelters()
		{
			return await _context.Shelters.Include(s => s.Animals).Where(s => !s.ShelterName.ToLower().Contains("deleted") && !s.ShelterName.ToLower().Contains("unassigned")).ToListAsync();
		}

		private async Task<List<AdoptionRequestDto>> RequestDtos(bool ? flag = false)
		{
			List<AdoptionRequest> AdoptionReq = await _context.AdoptionRequest.Where(a=> flag == false || a.Approved_At != null).ToListAsync();
			List<AdoptionRequestDto> RecentRequests = new List<AdoptionRequestDto>();
			AdoptionReq.ForEach(r =>
			{
				RecentRequests.Add(new AdoptionRequestDto()
				{
					requestId = r.Id,
					Adopter = new AdopterDto
					{
						Id = r.Adopter.Id,
						Uname = r.Adopter.Uname
					},
					Animal = new AnimalDto
					{
						id = r.Pet.id,
						name = r.Pet.name
					},
					Approved_At = r.Approved_At
				});
			});
			return RecentRequests;
		}
		public async Task<DashboardStatsDto> GetDashboardStats(int Dash)
		{
			switch(Dash)
			{
				case 1:
					List<AdoptionRequestDto> RecentRequests = await RequestDtos(true);
					List<Shelter> shelters = await Shelters();
					return new DashboardStatsDto
					{

						//TotalPets = await _context.Animals.Include(s=>s.Shelter).Where(a=> ).CountAsync(),
						//TotalPets = await _context.Animals.Include(a => a.Shelter).Where(a => !a.Shelter.ShelterName.ToLower().Contains("deleted")).CountAsync(),
						TotalShelters = shelters.Count(),
						TotalUsers = await _context.Users.Where(u => u.Banned_At == null && u.Deleted_At == null).CountAsync(),
						ActiveUsers = await _context.Users.CountAsync(u => u.Activated == 1),
						RecentRequests = RecentRequests,
						ApprovedAdoptions = RecentRequests
					.Count(),
						TotalAdoptions = await _context.AdoptionRequest.CountAsync()
					};
				default:
					return null;
			}
		}
	}
}
