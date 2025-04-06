using PetShelter.Models;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace PetShelter.Convertors
{
	public class UserConvertor : JsonConverter<User>
	{
		public override User Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
		{
			using (JsonDocument doc = JsonDocument.ParseValue(ref reader))
			{
				JsonElement root = doc.RootElement;
				root.TryGetProperty("role", out JsonElement Role);
				int.TryParse(Role.ToString(), out int role);
				switch (role)
				{
					case (int)User.UserType.Adopter:
						return JsonSerializer.Deserialize<Adopter>(root.GetRawText(), options);
					case (int)User.UserType.Admin:
						return JsonSerializer.Deserialize<Admin>(root.GetRawText(), options);
					default:
						return null;
				}
			}
		}
		public override void Write(Utf8JsonWriter writer, User value, JsonSerializerOptions options)
		{
			JsonSerializer.Serialize(writer, value, value.GetType(), options);
		}
	}
}

