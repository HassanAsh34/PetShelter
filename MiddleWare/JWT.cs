using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using PetShelter.DTOs;
using PetShelter.Models;

namespace PetShelter.MiddleWare
{
    public class JWT
	{
		
		public string SecretKey { get; set; }


		public string GenerateToken(UserDto userDetails)
		{

			var claims = new List<Claim>
			{
				new Claim(ClaimTypes.NameIdentifier, userDetails.Id.ToString()),
				new Claim(ClaimTypes.Name, userDetails.Uname),
				new Claim(ClaimTypes.Email, userDetails.Email),
				new Claim(ClaimTypes.Role, userDetails.Role.ToString()),
			};
			switch (userDetails.Role)
			{
				
				case User.UserType.Admin:
					var admindetails  = (AdminDto)userDetails;
					claims.Add(new Claim("AdminType",admindetails.adminType.ToString()));
					break;
				case User.UserType.Adopter:
					//userDetails = userDetails as AdminDto;
					break;
				case User.UserType.ShelterStaff:
					//userDetails = userDetails as AdminDto;
					break;

			}
			var userDetailsJson = JsonSerializer.Serialize(userDetails);
			claims.Add(new Claim(ClaimTypes.UserData, userDetailsJson));
			var tokenHandler = new JwtSecurityTokenHandler();
			var key = Encoding.ASCII.GetBytes(this.SecretKey);
			//if(userDetails.Role ==)
			var tokenDescriptor = new SecurityTokenDescriptor
			{
				Subject = new ClaimsIdentity(claims),
				Expires = DateTime.UtcNow.AddMinutes(60),
				SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
			};
			var token = tokenHandler.CreateToken(tokenDescriptor);
			return tokenHandler.WriteToken(token);
		}
	}
}