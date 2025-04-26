using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace PetShelter.DTOs
{
    public class LoginDto
    {
        [DisplayName("Email")]
        [Required(ErrorMessage = "please enter your email")]
        [MaxLength(255)]
        //[RegularExpression(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", ErrorMessage = "Please make sure your email is written correctly")]
        [EmailAddress(ErrorMessage = "Please make sure your email is written correctly")]

        public string Email { set; get; }

        [DisplayName("Password")]
        [Required]
        [MaxLength(255)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$", ErrorMessage = "password must contain at least 8 characters, at least 1 capital letter and number")]

        public string Password { set; get; }
    }
}
