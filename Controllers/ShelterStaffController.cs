using Microsoft.AspNetCore.Mvc;
using PetShelter.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetShelter.Models;
using PetShelter.DTOs;

namespace PetShelter.Controllers
{
	[Route("/Shelter Management")]
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
		public async Task<ActionResult<IEnumerable<ShelterCategory>>> ListCategories()
		{
			var shelterCategories = await _shelterStaffServices.ListCategories();
			if (shelterCategories == null)
			{
				return NotFound();
			}
			else
			{
				return Ok(shelterCategories);
			}
		}


		[HttpGet("List-Pets")]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status204NoContent)]
		public async Task<ActionResult<IEnumerable<AnimalDto>>> ListPets([FromQuery] int? CatId = 0)
		{
			IEnumerable<AnimalDto> animalDtos = await _shelterStaffServices.ListPets(CatId);
			if (animalDtos == null)
				return NoContent();
			else
				return Ok(animalDtos);
		}

		[HttpPost("Add-Pet")]
		[ProducesResponseType(StatusCodes.Status201Created)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		public async Task<ActionResult<Animal>> AddPet([FromBody] Animal animal)
		{
			int res = await _shelterStaffServices.AddPet(animal);
			switch (res)
			{
				case 0:
					return NotFound(new { message = "Category not found" });
				case > 0:
					return CreatedAtAction(nameof(AddPet), new { animal, message = "The pet was added successfully" });
				default:
					return BadRequest(new { message = "Something went wrong" });
			}
		}

		[HttpPut("Update-Pet")]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]

		public async Task<ActionResult<Animal>> UpdatePet([FromBody] Animal animal)
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
					if ((int)pet == 0)
						return NotFound(new { message = "The pet was not found" });
					else
						return BadRequest(new { message = "Something went wrong" });
				}
			}
		}

		[HttpGet("View-Pet/{id}")]
		//[AllowAnonymous]
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

		public async Task<ActionResult<bool>> DeletePet(AnimalDto animal)
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
	}
}
