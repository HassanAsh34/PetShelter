using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetShelter.Models
{
	public abstract class User
	{
		[Key]
		//[DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public int Id { set; get; }

		[DisplayName("UserName")]
		[Required]
		[MinLength(3,ErrorMessage = "Please make sure that your name is written correctly")]
		[MaxLength(50)]
		public string Uname { set; get; }

		[DisplayName("Email")]
		[Required(ErrorMessage ="please enter your email")]
		[MaxLength(255)]
		[RegularExpression(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",ErrorMessage ="Please make sure your email is written correctly")]
		public string Email { set; get; }

		[DisplayName("Password")]
		[Required]
		[MaxLength(255)]
		[RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$", ErrorMessage = "password must contain at least 8 characters, at least 1 capital letter and number")]

		public string Password { set; get; }
		[DisplayName("Role")]
		public int Role { set; get; }

		public enum UserType
		{
			Admin,
			Adopter,
			ShelterStaff
		}

		public int Activated { get; set; } = 0;

		public DateOnly ?Banned_At { get; set; }
		public DateTime ?ActivatedAt { get; set; }
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
		public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
	}
}
