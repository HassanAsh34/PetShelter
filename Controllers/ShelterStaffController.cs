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

		[HttpGet("Show Ctegories")]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status404NotFound)]
		public async Task<ActionResult<IEnumerable<ShelterCategory>>> ListCategories()
		{
			var shelterCategories = await _shelterStaffServices.ListCategories();
			if(shelterCategories == null)
			{
				return NotFound();
			}
			else
			{
				return Ok(shelterCategories);
			}
		}

	
		[HttpGet("List Pets")]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status404NotFound)]
		public async Task<ActionResult<IEnumerable<AnimalDto>>> ListPets([FromQuery]int ? CatId =0	)
		{
			IEnumerable<AnimalDto> animalDtos = await _shelterStaffServices.ListPets(CatId);
			if(animalDtos == null)
				return NotFound();
			else
				return Ok(animalDtos);
		}

		[HttpPost("Add Pet")]
		[ProducesResponseType(StatusCodes.Status201Created)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		public async Task<ActionResult<Animal>> AddPet([FromBody] Animal animal)
		{
			int res = await _shelterStaffServices.AddPet(animal);
			switch(res)
			{
				case 0:
					return NotFound(new { message = "Category not found" });
				case > 0:
					return CreatedAtAction(nameof(AddPet), new { animal, message = "The pet was added successfully" });
				default:
					return BadRequest(new { message = "Something went wrong" });
			}
		}
			
	}
}
