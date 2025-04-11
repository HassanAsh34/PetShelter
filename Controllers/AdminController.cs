using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Extensions;
using PetShelter.DTOs;
using PetShelter.MiddleWare;
using PetShelter.Models;
using PetShelter.Repository;
using PetShelter.Services;

namespace PetShelter.Controllers
{
    [Route("/Admin")]
	[ApiController]
	[Authorize(Roles = "Admin")]
	public class AdminController : ControllerBase
	{
		private readonly AdminServices _adminServices;

		private bool Authorize(int op)
		{
			var adminType = User.FindFirst("AdminType")?.Value;
			if (adminType != null)
			{
				switch (op) // authorization for different types of admins
				{
					case 1:
						if (adminType == Admin.AdminTypes.SuperAdmin.ToString())
							return true;
						else
							return false;
					case 2:
						if (adminType == Admin.AdminTypes.SuperAdmin.ToString() || adminType == Admin.AdminTypes.UsersAdmin.ToString())
							return true;
						else 
							return false;
					case 3:
						if (adminType == Admin.AdminTypes.SuperAdmin.ToString() || adminType == Admin.AdminTypes.ShelterAdmin.ToString())
							return true;
						else
							return false;
				}
			}
			return false;
		}
		public AdminController(AdminServices adminServices) {
			_adminServices = adminServices ?? throw new ArgumentNullException(nameof(adminServices));
		}
		//[Authorize()]
		//User managing
		[HttpGet("/List Users")]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<ActionResult<IEnumerable<UserDto>>> getUsers()
		{
			if(Authorize(2))
			{
				var users =  await _adminServices.ListUsers();
				return Ok(users);
			}
			else
				return Unauthorized();
		}

		[HttpGet("/UserDetails/{id}")]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<ActionResult<UserDto>> getUserDetails(int id)
		{
			if (Authorize(2))
			{
				var user = await _adminServices.getUserDetails(id);
				return Ok(user);
			}
			else
				return Unauthorized();
		}

		[HttpPut("/EditUserDetails")]
		public async Task<ActionResult<UserDto>> editUserDetails([FromBody] UserDto U)
		{
			if (Authorize(2))
			{
				switch(U)
				{
					case AdminDto admin:
						if(Authorize(1))
						{
							U = await _adminServices.UpdateUserDetails(U);
							return Ok(U);
						}
						else
							return Unauthorized();
					default:
						U = await _adminServices.UpdateUserDetails(U);
						return Ok(U);
				}
			}
			else
				return Unauthorized();
		}

		[HttpGet("/Add Admin Account")]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status201Created)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<ActionResult<AdminDto>> AddAdmin(Admin admin)
		{
			if (Authorize(2))
			{
				var Admin = await _adminServices.addAdmin(admin);
				if (Admin != null)
				{
					return Ok(Admin);
				}
				else
				{ return BadRequest(new { message = "Admin already exists" }); }
			
				//return Ok(user);
			}
			else
				return Unauthorized();
		}

		[HttpDelete("/Delete User")]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		[ProducesResponseType(StatusCodes.Status204NoContent)]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		public async Task<ActionResult<bool>> DeleteUser(UserDto U)
		{
			if (Authorize(2))
			{

				if (await _adminServices.deleteUser(U) == true)
				{
					return NoContent();
				}
				else
				{
					return BadRequest(new { message = "something went wrong" });
				}
			}
			else
				return Unauthorized();
		}

		//Shelter managing "creating categories within shelter"

		
		[HttpPost("/Add Category")]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status201Created)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public ActionResult<ShelterCategories> AddCategory([FromBody]ShelterCategories Cat)
		{
			if (Authorize(3))
			{
				return null;
			}
			else
			{
				return Unauthorized();
			}


		}
		

	}
}
