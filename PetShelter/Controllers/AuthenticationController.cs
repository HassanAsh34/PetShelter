using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetShelter.Data;
using PetShelter.DTOs;
using PetShelter.MiddleWare;
using PetShelter.Models;
using PetShelter.Services;
using PetShelter.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace PetShelter.Controllers
{
	[Route("AuthApi")]
	[ApiController]
	public class AuthenticationController : ControllerBase
	{
		private readonly UserService _userService;
		private readonly JWT _token;
		private readonly IHubContext<UserNotificationHub> _hubContext;

		public AuthenticationController(UserService userService, JWT token, IHubContext<UserNotificationHub> hubContext)
		{
			_userService = userService ?? throw new ArgumentNullException(nameof(userService));
			_token = token ?? throw new ArgumentNullException(nameof(token));
			_hubContext = hubContext;
		}

		[HttpPost("Register")]
		[ProducesResponseType(StatusCodes.Status201Created)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<ActionResult<UserDto>> Register([FromBody] User user)
		{
			Console.WriteLine($"Received registration request for user: {JsonSerializer.Serialize(user)}");
			var res = await _userService.Register(user);
			if (res == null)
			{
				Console.WriteLine("Registration failed: User already exists");
				return BadRequest(new { message = "User already exists" });
			}
			else
			{
				Console.WriteLine($"Registration successful for user: {JsonSerializer.Serialize(res)}");
				// Notify admins about new user registration
				await _hubContext.Clients.Group("Admins").SendAsync("ReceiveNewUserRegistration", res);
				return StatusCode(StatusCodes.Status201Created, new
				{
					res = res,
					message = "User Created Successfully"
				});
			}
		}

		[HttpPost("Login")]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<ActionResult<UserDto>> Login([FromBody] LoginDto login)
		{
			var res = await _userService.Login(login);
			if (res != null)
			{
				switch (res.Activated)
				{
					case 0:
						return BadRequest(new { message = "Your account is currently inactive" });
					case 1:
						var token = _token.GenerateToken(res);
						return Ok(new { token = token, user = res }); // lowercase keys (token, user) to match frontend
					case 2:
						return BadRequest(new { message = "Your account has been suspended" });
					default:
						return BadRequest("Something went wrong");
				}
			}
			else
			{
				return BadRequest(new { message = "Invalid Email or Password" });
			}
		}

		[HttpPut("EditUserDetails")]
		public ActionResult<object> UpdateUser([FromBody] UserDto user)
		{
			var res = _userService.UpdateUserDetails(user);
			if (res != null)
			{
				return Ok(new {user ,message = "User Updated Successfully" });
			}
			else
			{
				return BadRequest(new { message = "updating user failed" });
			}
		}

		[Authorize]
		[HttpGet]
		public ActionResult<UserDto> Protected()
		{
			var currentUser = GetCurrentUser();
			if (currentUser == null)
			{
				return Unauthorized(new { message = "User details not found in token" });
			}

			return Ok(currentUser);
		}

		// ➡️ NEW Helper Method for User extraction
		private UserDto GetCurrentUser()
		{
			var userDetailsJson = User.FindFirst(ClaimTypes.UserData)?.Value;
			if (string.IsNullOrEmpty(userDetailsJson))
			{
				return null;
			}

			try
			{
				return JsonSerializer.Deserialize<UserDto>(userDetailsJson);
			}
			catch (JsonException)
			{
				return null;
			}
		}
	}
}
	