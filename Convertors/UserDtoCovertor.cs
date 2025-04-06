using System.Text.Json;
using System.Text.Json.Serialization;
using PetShelter.DTOs;
using PetShelter.Models;

namespace PetShelter.Convertors
{
	public class UserDtoCovertor : JsonConverter<UserDto>
	{
		public override UserDto? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
		{
			using (JsonDocument doc = JsonDocument.ParseValue(ref reader))
			{
				JsonElement root = doc.RootElement;
				root.TryGetProperty("role", out JsonElement Role);
				int.TryParse(Role.ToString(), out int role);
				switch (role)
				{
					case (int)User.UserType.Adopter:
						return JsonSerializer.Deserialize<AdopterDto>(root.GetRawText(), options);
					case (int)User.UserType.Admin:
						return JsonSerializer.Deserialize<AdminDto>(root.GetRawText(), options);
					default:
						return null;
				}
			}
		}

		public override void Write(Utf8JsonWriter writer, UserDto value, JsonSerializerOptions options)
		{
			JsonSerializer.Serialize(writer, value, value.GetType(), options);
		}
	}
}
