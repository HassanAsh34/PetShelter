using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Extensions;
using PetShelter.DTOs;
using PetShelter.MiddleWare;
using PetShelter.Models;
using PetShelter.Repository;
using PetShelter.Services;
using PetShelter.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace PetShelter.Controllers
{
	[Route("/Admin")]
	[ApiController]
	[Authorize(Roles = "Admin")]
	public class AdminController : ControllerBase
	{
		private readonly AdminServices _adminServices;
		private readonly IHubContext<DashboardHub> _hubContext;

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
		public AdminController(AdminServices adminServices, IHubContext<DashboardHub> hubContext)
		{
			_adminServices = adminServices ?? throw new ArgumentNullException(nameof(adminServices));
			_hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
		}
		//[Authorize()]
		//User managing
		[HttpGet("List-Users")]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<ActionResult<IEnumerable<UserDto>>> getUsers()//done
		{
			if (Authorize(2))
			{
				var users = await _adminServices.ListUsers();
				return Ok(users);
			}
			else
				return Unauthorized();
		}

		[HttpGet("List-Unassigned-Staff")]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<ActionResult<IEnumerable<UserDto>>> getUnassignedStaff()//done
		{
			if (Authorize(2))
			{
				var users = await _adminServices.ListUsers(true);
				return Ok(users);
			}
			else
				return Unauthorized();
		}

		[HttpGet("User-Details/{id}")]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		[ProducesResponseType(StatusCodes.Status404NotFound)]
		public async Task<ActionResult<UserDto>> getUserDetails(int id, [FromQuery] int role)
		{
			if (Authorize(2))
			{
				var user = await _adminServices.getUserDetails(id, role);
				if (user != null)
				{
					return Ok(user);
				}
				else
				{
					return NotFound();
				}
			}
			else
				return Unauthorized();
		}



		[HttpPut("EditUserDetails")]
		public async Task<ActionResult<UserDto>> editUserDetails([FromBody] UserDto U)
		{
			if (Authorize(2))
			{
				bool u;
				switch (U)
				{
					case AdminDto admin:
						if (Authorize(1))
						{
							u = await _adminServices.UpdateUserDetails(U);
							if(u == true)
								return Ok(U);
							else
								return BadRequest(new { message = "Update Failed" });
							//return Ok(U);
						}
						else
							return Unauthorized();
					default:
						u = await _adminServices.UpdateUserDetails(U);
						if (u == true)
							return Ok(U);
						else
							return BadRequest(new { message = "Update Failed" });
				}
			}
			else
				return Unauthorized();
		}

		[HttpPut("Activate-Deactivate-Account")]
		public async Task<ActionResult<string>> Activate_Deactivate_User([FromBody] UserDto U)//done
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

		[HttpPut("Ban-Account")]
		public async Task<ActionResult<bool>> BanUser([FromBody] UserDto U)//done
		{
			if (((User.UserType)U.Role == Models.User.UserType.Admin && Authorize(1)) || ((User.UserType)U.Role != Models.User.UserType.Admin && Authorize(2)))
			{
				var res = await _adminServices.ToggleUserActivation(U, true);
				return Ok(res);
			}
			else
				return Unauthorized();
		}

		[HttpPost("Add-User")]
		[ProducesResponseType(StatusCodes.Status201Created)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<ActionResult<UserDto>> addUser([FromBody] User user)//done
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

		[HttpPost("Add-Admin-Account")]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status201Created)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]

		public async Task<ActionResult<AdminDto>> AddAdmin(Admin admin)//done
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

		[HttpDelete("Delete-User")]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		[ProducesResponseType(StatusCodes.Status204NoContent)]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		public async Task<ActionResult<bool>> DeleteUser(UserDto U)//done
		{

			if (((User.UserType)U.Role == Models.User.UserType.Admin && Authorize(1)) || ((User.UserType)U.Role != Models.User.UserType.Admin && Authorize(2)))
			{
				if (await _adminServices.deleteUser(U) == true)
				{
					return Ok(new { message = "the User was removed successfully" });
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


		[HttpPost("Add-Category")]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status201Created)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<ActionResult<object>> AddCategory([FromBody] ShelterCategory Cat)//done
		{
			if (Authorize(3))
			{
				var category = await _adminServices.addCategory(Cat);
				if (category is CategoryDto cat)
					return Ok(new { cat, message = "the Category was added successfully" });
				else
				{
					if ((int)category == -1)
						return BadRequest(new { message = "that Shelter doesn't Exist" });
					else
						return BadRequest(new { message = "that Category already Exist" });

				}
			}
			else
			{
				return Unauthorized();
			}


		}


		[HttpGet("Show-Categories")]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<ActionResult<IEnumerable<ShelterCategory>>> getCategories()
		{
			if (Authorize(3))
			{
				IEnumerable<ShelterCategory> Categories = await _adminServices.ListCategories();
				if (Categories == null)
				{
					return NoContent();
				}
				return Ok(Categories);
			}
			else
				return Unauthorized();
		}

		[HttpDelete("Delete-Category")]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		[ProducesResponseType(StatusCodes.Status204NoContent)]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		public async Task<ActionResult<bool>> DeleteCategory(ShelterCategory category)//done
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

		[HttpPost("Add-Shelter")]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status201Created)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]

		public async Task<ActionResult<ShelterDto>> AddShelter(Shelter shelter)//done
		{
			if (Authorize(1))
			{
				var res = await _adminServices.addShelter(shelter);
				if (res != null)
				{
					return Ok(res);
				}
				else
				{
					return BadRequest(new { message = "Shelter already exists" });
				}
			}
			else
				return Unauthorized();
		}

		//public async Task<ActionResult<ShelterDto>> UpdateShelter(Shelter shelter)
		//{
		//	if (Authorize(1))
		//	{
		//		var res = await _adminServices.UpdateShelter(shelter);
		//		if (res != null)
		//		{
		//			return Ok(res);
		//		}
		//		else
		//		{
		//			return BadRequest(new { message = "Shelter already exists" });
		//		}
		//	}
		//	else
		//		return Unauthorized();
		//}

		[HttpGet("Show-Shelters-details/{id}")]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]

		public async Task<ActionResult<Shelter>> ShowShelter(int id)
		{
			if (Authorize(1))
			{
				var res = await _adminServices.ShowShelter(id);
				if (res != null)
				{
					return Ok(res);
				}
				else
				{
					return BadRequest(new { message = "Shelter not found" });
				}
			}
			else
				return Unauthorized();
		}

		[HttpGet("Show-Shelters")]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<ActionResult<IEnumerable<Shelter>>> ShowShelters()
		{
			if (Authorize(1))
			{
				var res = await _adminServices.ShowShelter();
				if (res != null)
				{
					return Ok(res);
				}
				else
				{
					return BadRequest(new { message = "Shelter not found" });
				}
			}
			else
				return Unauthorized();
		}

		[HttpDelete("Delete-Shelter")]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<ActionResult<int>> DeleteShelter(Shelter shelter)//done
		{
			if (Authorize(1))
			{
				var res = await _adminServices.deleteShelter(shelter);
				if (res > 0)
				{
					return Ok(new { message = "the Shelter was removed successfully" });
				}
				else
				{
					return BadRequest(new { message = "Shelter doesnt exist" });
				}
			}
			else
				return Unauthorized();
		}

		[HttpPut("Assign-to-shelter")]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<ActionResult<bool>> AssigntoShelter(StaffDto staff)//done
		{
			if (Authorize(2))
			{
				var res = await _adminServices.AssignToShelter(staff);
				if (res > 0)
				{
					return Ok(new { message = "the Staff was assigned to the Shelter successfully" });
				}
				else
				{
					switch (res)
					{
						case -1: return BadRequest(new { message = "the Staff doesn't Exist" });
						case -2: return BadRequest(new { message = "the Shelter doesn't Exist" });
						default: return Ok(new { message = "Nothing changed" });
					}
				}
			}
			else
			{
				return Unauthorized();
			}
		}

		[HttpGet("dashboard-stats")]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
		{
			if (Authorize(1)) // Only SuperAdmin can view dashboard stats
			{
				var stats = await _adminServices.GetDashboardStats();
				// Notify all connected clients about the update
				await _hubContext.Clients.All.SendAsync("ReceiveDashboardUpdate", stats);
				return Ok(stats);
			}
			else
				return Unauthorized();
		}
	}
}
