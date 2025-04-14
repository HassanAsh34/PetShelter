using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using PetShelter.Data;
using PetShelter.DTOs;
using PetShelter.MiddleWare;
using PetShelter.Models;
using PetShelter.Services;

namespace PetShelter.Controllers
{
    [Route("AuthApi")]
	[ApiController]
	public class AuthenticationController : ControllerBase
	{
		//private readonly UserRepository _userRepository;

		private readonly UserService _userService;

		private readonly JWT _token;
		public AuthenticationController(UserService userService, JWT token)//, UserRepository userRepository) //dont forget the constructor injection 
		{
			_userService = userService ?? throw new ArgumentNullException(nameof(userService));
			_token = token ?? throw new ArgumentNullException(nameof(token));
			//_userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
		}

		[HttpPost("/Register")]
		[ProducesResponseType(StatusCodes.Status201Created)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<ActionResult<UserDto>> Register([FromBody] User user)
		{
			var res = await _userService.Register(user);
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
		//[Authorize]
		[HttpPost("/Login")]
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
						return Ok(new { Token = token, User = res });
					case 2:
						return BadRequest(new { message = "Your account has been suspended" });
					default:
						//return StatusCodes.Status500InternalServerError;
						return BadRequest("Something went wrong");
				}
			}
			else
			{
				return BadRequest(new { Message = "Invalid Email or Password" });
			}
		}

		[Authorize]
		[HttpGet()]
		public ActionResult<UserDto> Protected()
		{
			var userDetailsJson = User.FindFirst("userDetails")?.Value;
			var userDetails = JsonSerializer.Deserialize<UserDto>(userDetailsJson);

			return Ok(userDetails);

			
		}



		//[HttpGet("/GetKey")]
		//public ActionResult<JWT> generateToken(JWT j)
		//{
		//	return Ok(j);
		//}
		//		public async Task<ActionResult<User>> Register([FromBody] User user) bec that one will require a custom deserializer
		//		{
		//			if (await _userRepository.UserExistence(user.Email) == true)
		//			{
		//				return BadRequest(new { message = "user already exists" });
		//			}
		//			else
		//{
		//	return Ok(new
		//	{
		//		User = await _userRepository.AddUser(user),
		//		Message = "User was added successfully"
		//	});
		//}
		//		}
	}
}
