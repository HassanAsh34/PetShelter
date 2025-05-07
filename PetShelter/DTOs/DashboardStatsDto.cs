namespace PetShelter.DTOs
{
    public class DashboardStatsDto
    {
        public int TotalShelters { get; set; }
        public int TotalPets { get; set; }
        public int ActiveUsers { get; set; }
        public int AdoptionsThisMonth { get; set; }
        public int PendingAdoptions { get; set; }
        public int TotalAdoptions { get; set; }

        public int TotalUsers { get; set; }
	}
} 