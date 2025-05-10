using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetShelter.DTOs;
using PetShelter.Models;
using PetShelter.Services;

namespace PetShelter.Controllers
{
	[Authorize(Roles = "Adopter")]
	[ApiController]
	[Route("/Adoption")]
	public class AdoptionController : ControllerBase
	{
		private readonly AdoptionServices _adoptionServices;
		public AdoptionController(AdoptionServices adoptionServices)
		{
			_adoptionServices = adoptionServices ?? throw new ArgumentNullException(nameof(adoptionServices));
		}

		[AllowAnonymous]
		[HttpGet("List-Pets")]
		[ProducesResponseType(StatusCodes.Status200OK)]
		//[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		//[ProducesResponseType(StatusCodes.Status404NotFound)]
		[ProducesResponseType(StatusCodes.Status204NoContent)]
		public async Task<ActionResult<IEnumerable<AnimalDto>>> ListPets([FromQuery]String ? Catname ="")//done
		{
			string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			int.TryParse(userId, out int parsedUserId);
			var pets = await _adoptionServices.ListPets(Catname,parsedUserId);
			if (pets == null)
			{
				return NoContent();
			}
			else
			{
				return Ok(pets);
			}
		}

		[HttpPost("Adopt")]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<ActionResult<AdoptionRequestDto>> Adopt([FromBody] AdoptionRequest adoption)//done
		{
			var res = await _adoptionServices.Adopt(adoption);
			switch(res)
			{
				case >0:
					return Ok(new {message="Your Adoption Request is submitted successfully"});
				case -1:
					return BadRequest(new { message = "Adoption failed" });
				default:
					return BadRequest(new { message = "Request already exists" });
			}
		}

		[HttpGet("Adoption-History")]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status404NotFound)]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		public async Task<ActionResult<IEnumerable<AdoptionRequestDto>>> AdoptionHistory()
		{
			try
			{
				// Get the user ID from the token
				var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
				//if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int adopterId))
				//{
				//	return Unauthorized(new { message = "Invalid user ID in token" });
				//}
				//Console.WriteLine(userId.GetType());
				int.TryParse(userId, out var adoptionId);
				Console.WriteLine(adoptionId);
				if (adoptionId == 0)
					return BadRequest(new { message = "something went wrong" });
				var history = await _adoptionServices.AdoptionHistory(adoptionId);
				if (history == null)
				{
					return Ok(new List<AdoptionRequestDto>());
				}
				return Ok(history);
				//return Ok(history);
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "An error occurred while fetching adoption history", error = ex.Message });
			}
		}

		[HttpGet("View-Adoption/{id}")]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status404NotFound)]
		public async Task<ActionResult<AdoptionRequestDto>> ViewAdoption(int id)//done
		{
			var adoption = await _adoptionServices.ViewAdoption(id);
			if (adoption != null)
			{
				return Ok(adoption);
			}
			else
			{
				return NotFound(new { message = "Adoption not found" });
			}
		}

		[HttpPut("Cancel-Adoption/{id}")]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<ActionResult<bool>> CancelAdoption(int id)//done
		{
			var res = await _adoptionServices.CancelAdoption(id);
			if (res)
			{
				return Ok(new { message = "Your Adoption Request is cancelled successfully" });
			}
			else
			{
				return BadRequest(new { message = "Something went wrong" });
			}
		}

		[AllowAnonymous]
		[HttpGet("View-Pet/{id}")]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status404NotFound)]
		public async Task<ActionResult<object>> ViewPet(int id)
		{
			var pet = await _adoptionServices.ShowPet(id);
			if (pet != null)
			{
				return Ok(pet);
			}
			else
			{
				return NotFound(new { message = "Pet not found" });
				//}
				//else
				//{
				//	return BadRequest(new { message = "Something went wrong" });
				//}
			}
		}

	}

}
