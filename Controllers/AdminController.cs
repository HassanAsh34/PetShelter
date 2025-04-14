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
		[HttpGet("List Users")]
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

		[HttpGet("UserDetails/{id}")]
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

		[HttpPut("EditUserDetails")]
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

		[HttpPut("Activate-DeactivateAccount")]
		public async Task<ActionResult<string>> Activate_Deactivate_User([FromBody] UserDto U)
		{
			if (((User.UserType)U.Role == Models.User.UserType.Admin && Authorize(1)) || ((User.UserType)U.Role != Models.User.UserType.Admin && Authorize(2)))
			{
				var res = await _adminServices.ToggleUserActivation(U);
				return Ok(res);
			}
			else
				return Unauthorized();
		}

		//[HttpPut("/DeactivateAccount")]
		//public async Task<ActionResult<bool>> DeactivateUser([FromBody] UserDto U)
		//{
		//	if (((User.UserType)U.Role == Models.User.UserType.Admin && Authorize(1)) || ((User.UserType)U.Role != Models.User.UserType.Admin && Authorize(2)))
		//	{
		//		return Ok(null);
		//	}
		//	else
		//		return Unauthorized();
		//}

		[HttpPut("BanAccount")]
		public async Task<ActionResult<bool>> BanUser([FromBody] UserDto U)
		{
			if (((User.UserType)U.Role == Models.User.UserType.Admin && Authorize(1)) || ((User.UserType)U.Role != Models.User.UserType.Admin && Authorize(2)))
			{
				var res = await _adminServices.ToggleUserActivation(U,true);
				return Ok(res);
			}
			else
				return Unauthorized();
		}

		[HttpPost("Add User")]
		[ProducesResponseType(StatusCodes.Status201Created)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<ActionResult<UserDto>> addUser([FromBody] User user)
		{
			var res = await _adminServices.addUser(user);
			if (res == null)
			{
				return BadRequest(new { message = "user already exists" });
			}
			else
			{
				return StatusCode(StatusCodes.Status201Created, new
				{
					res = res,
					meessage = "User Created Successfully"
				});
			}
		}

		[HttpPost("Add Admin Account")]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status201Created)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]

		public async Task<ActionResult<AdminDto>> AddAdmin(Admin admin)
		{
			if (Authorize(1))
			{
				var Admin = await _adminServices.addAdmin(admin);
				if (Admin != null)
				{
					return Ok(Admin);
				}
				else
				{ 
					return BadRequest(new { message = "Admin already exists" });
				}
			
				//return Ok(user);
			}
			else
				return Unauthorized();
		}

		[HttpDelete("Delete User")]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		[ProducesResponseType(StatusCodes.Status204NoContent)]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		public async Task<ActionResult<bool>> DeleteUser(UserDto U)
		{
			
			if(((User.UserType)U.Role == Models.User.UserType.Admin && Authorize(1))|| ((User.UserType)U.Role != Models.User.UserType.Admin && Authorize(2)))
			{ 
				if (await _adminServices.deleteUser(U) == true)
				{
					return Ok(new {message = "the User was removed successfully"});
				}
				else
				{
					return BadRequest(new { message = "something went wrong" });
				}
			}
			else
				return Unauthorized();
		}

		//adding a user need to be handled

		//Shelter managing "creating categories within shelter"

		
		[HttpPost("Add Category")]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status201Created)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<ActionResult<ShelterCategory>> AddCategory([FromBody]ShelterCategory Cat)
		{
			if (Authorize(3))
			{
				ShelterCategory category = await _adminServices.addCategory(Cat);
				if (category == null)
					return BadRequest(new { message = "the Category Already Exist" });
				else
					return Ok(new {category ,message = "the Category was added successfully" });
			}
			else
			{
				return Unauthorized();
			}


		}


		[HttpGet("Show Categories")]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<ActionResult<IEnumerable<ShelterCategory>>> getCategories()
		{
			if (Authorize(3))
			{
				IEnumerable<ShelterCategory> Categories = await _adminServices.ListCategories();
				if(Categories == null)
				{
					return NoContent();
				}
				return Ok(Categories);
			}
			else
				return Unauthorized();
		}

		[HttpDelete("Delete Category")]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		[ProducesResponseType(StatusCodes.Status204NoContent)]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		public async Task<ActionResult<bool>> DeleteUser(ShelterCategory category)
		{
			if (Authorize(2))
			{

				if (await _adminServices.deleteCategory(category) == true)
				{
					return Ok(new { message = "the Category was removed successfully" });
				}
				else
				{
					return BadRequest(new { message = "something went wrong" });
				}
			}
			else
				return Unauthorized();
		}


	}
}
