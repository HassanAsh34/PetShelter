using System.Text.Json;
using System.Text.Json.Serialization;
using PetShelter.Models;
using PetShelter.DTOs;

namespace PetShelter.Converters
{
	public class ShelterConverter : JsonConverter<Shelter>
	{
		public override Shelter Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
		{
			using (JsonDocument doc = JsonDocument.ParseValue(ref reader))
			{
				JsonElement root = doc.RootElement;
				Console.WriteLine(root.ToString());
				var shelter = new Shelter
				{
					ShelterID = root.TryGetProperty("ShelterID", out var shelterId) ? shelterId.GetInt32() : 0,
					ShelterName = root.TryGetProperty("ShelterName", out var ShelterName)?ShelterName.GetString():null,
					Location = root.TryGetProperty("Location", out var loc) ? loc.GetString() : null,
					Phone = root.TryGetProperty("Phone", out var phone) ? phone.GetString() : null,
					Description = root.TryGetProperty("Description", out var desc) ? desc.GetString() : null,
					//Category = root.TryGetProperty("categories", out var categories)
					//	? JsonSerializer.Deserialize<IEnumerable<ShelterCategory>>(categories.GetRawText(), options)
					//	: null
				};

				return shelter;
			}
		}

		public override void Write(Utf8JsonWriter writer, Shelter value, JsonSerializerOptions options)
		{
			var dto = new ShelterDto
			{
				ShelterId = value.ShelterID,
				ShelterName = value.ShelterName,
				ShelterLocation = value.Location,
				ShelterPhone = value.Phone,
				Description = value.Description,
				Categories = value.Category,
				CountStaff = value.Staff?.Count() ?? 0
			};

			JsonSerializer.Serialize(writer, dto, options);
		}
	}
}
