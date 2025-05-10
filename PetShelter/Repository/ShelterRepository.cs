using PetShelter.DTOs;
using PetShelter.Models;

namespace PetShelter.Repository
{
	public class ShelterRepository
	{
		//public async Task<bool> ShelterExistence(Shelter shelter)
		//{
		//	var res = await _context.Shelters.FirstOrDefaultAsync(a => a.ShelterName.ToLower() == (shelter.ShelterName != null ? shelter.ShelterName.ToLower() : "") || a.ShelterID == shelter.ShelterID);
		//	if (res != null)
		//	{
		//		return true;
		//	}
		//	else
		//		return false;
		//}
		//public async Task<Shelter> AddShelter(Shelter shelter)
		//{
		//	if (shelter != null)
		//	{
		//		_context.Shelters.Add(shelter);
		//		ShelterCategory category = new ShelterCategory()
		//		{
		//			Shelter_FK = shelter.ShelterID,
		//			CategoryName = $"{shelter.ShelterName}-Unset",
		//			CategoryDescription = ""

		//		};
		//		_context.Add(category);
		//		await _context.SaveChangesAsync();
		//		return shelter;
		//	}
		//	else
		//		return null;
		//}

		//public async Task<int> AssignToShelter(StaffDto staff)
		//{
		//	ShelterStaff s = await _context.Staff.FirstOrDefaultAsync(s => s.Id == staff.Id);
		//	if (s != null)
		//	{
		//		s.Shelter_FK = staff.Shelter_FK;
		//		s.HiredDate = DateOnly.FromDateTime(DateTime.Now);
		//		return await _context.SaveChangesAsync();
		//	}
		//	else
		//		return -1;//indicates that the staff does not exist
		//}

		//public async Task<object> ShowShelter(int? id = 0)
		//{
		//	if (id != 0)
		//	{
		//		Shelter shelter = await _context.Shelters
		//			.Include(s => s.Staff)
		//			.Include(s => s.Category)
		//			.FirstOrDefaultAsync(s => s.ShelterID == id);
		//		if (shelter != null)
		//		{
		//			return shelter;
		//		}
		//		else
		//			return null; //indicates that the shelter does not exist
		//	}
		//	else
		//	{
		//		return await _context.Shelters.Where(s => !s.ShelterName.ToLower().Contains("deleted") && !s.ShelterName.ToLower().Contains("unassigned"))
		//			.Include(s => s.Staff)
		//			.Include(s => s.Category)
		//			.ToListAsync();
		//	}
		//}

		////public async Task<IEnumerable<Shelter>> ListShelters()
		////{
		////	return await _context.Shelters.ToListAsync();
		////}

		//public async Task<int> DeleteShelter(Shelter shelter)
		//{
		//	Shelter Shelter = await _context.Shelters.Include(s => s.Staff).Include(s => s.Animals).FirstOrDefaultAsync(s => s.ShelterID == shelter.ShelterID);
		//	if (Shelter != null)
		//	{
		//		Shelter deleted = await _context.Shelters.FirstOrDefaultAsync(s => s.ShelterName.ToLower().Contains("deleted"));
		//		List<Animal> animals = Shelter.Animals.ToList();
		//		List<AdoptionRequest> requests = await _context.AdoptionRequest.Where(A => A.Shelter_FK == Shelter.ShelterID).ToListAsync();
		//		ShelterCategory category = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryName.ToLower().Contains("unset"));
		//		animals.ForEach(a =>
		//		{
		//			if (a.Adoption_State == (int)Animal.AdoptionState.Adopted)
		//			{
		//				a.Shelter_FK = deleted.ShelterID;
		//				a.Category_FK = category.CategoryId;
		//				requests.Where(r => r.PetId_FK == a.id).ToList().ForEach(r =>
		//				{
		//					if (r.Status == AdoptionRequest.AdoptionRequestStatus.Approved)
		//						r.Shelter_FK = deleted.ShelterID;
		//					else
		//						_context.Remove(r);
		//				});

		//			}
		//			else
		//			{
		//				_context.RemoveRange(requests.Where(r => r.PetId_FK == a.id).ToList());
		//				_context.Remove(a);
		//			}
		//		});
		//		await deleteCategory(null, true, Shelter.ShelterID);
		//		_context.RemoveRange(Shelter.Staff.ToList());
		//		_context.Remove(Shelter);
		//		return await _context.SaveChangesAsync();
		//	}
		//	else
		//		return -1; //indicates that the shelter does not exist
		//}
	}
}
