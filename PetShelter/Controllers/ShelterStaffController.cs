using Microsoft.AspNetCore.Mvc;
using PetShelter.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetShelter.Models;
using PetShelter.DTOs;
using System.Security.Cryptography;

namespace PetShelter.Controllers
{
	[Route("/Shelter-Management")]
	[ApiController]
	[Authorize(Roles = "ShelterStaff")]
	public class ShelterStaffController : ControllerBase
	{
		private readonly ShelterStaffServices _shelterStaffServices;

		private bool Authorize(int op)
		{
			var StaffType = User.FindFirst("StaffType")?.Value;
			if (StaffType != null)
			{
				switch (op) // authorization for different types of admins
				{
					case 1:
						if (StaffType == ShelterStaff.StaffTypes.Manager.ToString())
							return true;
						else
							return false;
					case 2:
						if (StaffType == ShelterStaff.StaffTypes.Manager.ToString() || StaffType == ShelterStaff.StaffTypes.interviewer.ToString())
							return true;
						else
							return false;
					case 3:
						if (StaffType == ShelterStaff.StaffTypes.Manager.ToString() || StaffType == ShelterStaff.StaffTypes.CareTaker.ToString())
							return true;
						else
							return false;
				}
			}
			return false;
		}
		public ShelterStaffController(ShelterStaffServices shelterStaffServices)
		{
			_shelterStaffServices = shelterStaffServices ?? throw new ArgumentNullException(nameof(shelterStaffServices));
		}

		[HttpGet("Show-Categories")]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status404NotFound)]
		public async Task<ActionResult<IEnumerable<ShelterCategory>>> ListCategories()//done
		{
			int shelter_FK = int.Parse(User.FindFirst("ShelterId")?.Value);
			var shelterCategories = await _shelterStaffServices.ListCategories(shelter_FK);
			if (shelterCategories is IEnumerable<CategoryDto> cats)
			{
				return Ok(shelterCategories);
			}
			else
			{
				if((int)shelterCategories == -1)
					return Unauthorized(new { message = "You are not assigned to a shelter yet" });
				else
					return NotFound(new { message = "No categories found" });
			}
		}


		[HttpGet("List-Pets")]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status204NoContent)]
		public async Task<ActionResult<IEnumerable<AnimalDto>>> ListPets([FromQuery] int? CatId = 0)//done
		{
			if(Authorize(3))
			{
				int shelter_ID = int.Parse(User.FindFirst("ShelterId")?.Value);
				if(shelter_ID == 1)
					return Unauthorized(new { message = "You are not assigned to a shelter yet" });
				IEnumerable <AnimalDto> animalDtos = await _shelterStaffServices.ListPets(CatId,shelter_ID);
				if (animalDtos == null)
					return NoContent();
				else
				{
                    foreach (var item in animalDtos)
                    {
						Console.WriteLine(item.Adoption_State);
                    }
					return Ok(animalDtos);
				}	
			}
			else
			{
				return Unauthorized(new { message = "You are not authorized to perform this operation" });
			}
		}

		[HttpPost("Add-Pet")]
		[ProducesResponseType(StatusCodes.Status201Created)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		public async Task<ActionResult<Animal>> AddPet([FromBody] Animal animal) //done
		{
			Console.Write(animal.GetType());
			if(Authorize(3))
			{
				var res = await _shelterStaffServices.AddPet(animal);
				switch (res)
				{
					case 0:
						return NotFound(new { message = "Category not found" });
					case AnimalDto animalDto:
						return Ok(new { animalDto, message = "The pet was added successfully" });
					default:
						return BadRequest(new { message = "Something went wrong" });
				}
				//return null;
			}
			else
			{
				return Unauthorized(new { message = "You are not authorized to perform this operation" });
			}
		}

		[HttpPut("Update-Pet")]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]

		public async Task<ActionResult<Animal>> UpdatePet([FromBody] Animal animal)//done
		{
			if (Authorize(3) == false)
				return Unauthorized(new { message = "You are not authorized to perform this operation" });
			else
			{
				var pet = await _shelterStaffServices.UpdatePet(animal);
				if (pet is AnimalDto p)
					return Ok(new { p, message = "The pet was updated successfully" });
				else
				{
					switch((int)pet)
					{
						case 0:
							return Ok(new { message = "Nothing changed" });
						case -2:
							return NotFound(new { message = "The pet was not found" });
						case -3:
							return NotFound(new { message = "Category not found" });
						default:
							return BadRequest(new { message = "Something went wrong" });
					}
					//if ((int)pet == -1)
					//	return NotFound(new { message = "The pet was not found" });
					//else
					//	return BadRequest(new { message = "Something went wrong" });
				}
			}
		}

		[HttpGet("View-Pet/{id}")]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status404NotFound)]
		public async Task<ActionResult<object>> ShowPet(int id)
		{
			var pet = await _shelterStaffServices.ViewPet(id);
			if (pet != null)
			{
				return Ok(pet);
			}
			else
			{
				return NotFound(new { message = "Pet not found" });
			}
		}

		[HttpDelete("Delete-Pet")]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]

		public async Task<ActionResult<bool>> DeletePet(AnimalDto animal)//not working
		{
			if (Authorize(3) == false)
				return Unauthorized(new { message = "You are not authorized to perform this operation" });
			else
			{
				var res = await _shelterStaffServices.RemovePet(animal);
				if (res)
				{
					return Ok(new { message = "The pet was deleted successfully" });
				}
				else
				{
					return BadRequest(new { message = "Something went wrong" });
				}
			}

		}

		[HttpGet("Show-Adoption-Requests")]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status204NoContent)]

		public async Task<ActionResult<IEnumerable<AdoptionRequestDto>>> ListAdoptionRequests()//done
		{
			if (Authorize(2) == false)
				return Unauthorized(new { message = "You are not authorized to perform this operation" });
			else
			{
				int shelter_ID = int.Parse(User.FindFirst("ShelterId")?.Value);
				Console.WriteLine(shelter_ID);
				if (shelter_ID == 1)
					return Unauthorized(new { message = "You are not assigned to a shelter yet" });
				IEnumerable<AdoptionRequestDto> adoptionRequests = await _shelterStaffServices.ListAdoptionRequests(shelter_ID);
				if (adoptionRequests == null)
					return NoContent();
				else
				{
					return Ok(adoptionRequests);
				}	
			}
		}



		[HttpPut("Approve-Adoption-Request/{requestId}")]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		public async Task<ActionResult<int>> ApproveAdoptionRequest(int requestId)//done
		{
			if (Authorize(2) == false)
				return Unauthorized(new { message = "You are not authorized to perform this operation" });
			else
			{
				var res = await _shelterStaffServices.ApproveAdoptionRequest(requestId);
				if (res > 0)
				{
					return Ok(new { message = "The adoption request was approved successfully" });
				}
				else
				{
					switch (res)
					{
						case 0:
							return BadRequest(new { message = "nothing changed" });
						case -1:
							return NotFound(new { message = "The adoption request was not found" });
						case -3:
							return NotFound(new { message = "The interview was not scheduled" });
						default:
							return NotFound(new { message = "something went wrong" });
					}
				}
			}
		}

		//[HttpPut("Reject-Adoption-Request")]
		//[ProducesResponseType(StatusCodes.Status200OK)]
		//[ProducesResponseType(StatusCodes.Status400BadRequest)]
		//[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		//public Task<ActionResult<bool>> RejectAdoptionRequest(int Rid)
		//{
		//	if (Authorize(2) == false)
		//		return Unauthorized(new { message = "You are not authorized to perform this operation" });
		//	else
		//	{
		//		var res = _shelterStaffServices.RejectAdoptionRequest(Rid);
		//		if (res)
		//		{
		//			return Ok(new { message = "The adoption request was rejected successfully" });
		//		}
		//		else
		//		{
		//			return BadRequest(new { message = "Something went wrong" });
		//		}
		//	}
		//}

	}
}
