namespace PetShelter.Models
{
	public class Admin : User
	{
		public int AdminType { get; set; }
		public enum AdminTypes
		{
			SuperAdmin,
			ShelterAdmin,
			UsersAdmin
		}
	}
}
