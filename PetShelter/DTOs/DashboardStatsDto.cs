namespace PetShelter.DTOs
{
    public class DashboardStatsDto
    {
        public int TotalShelters { get; set; }
        public int TotalPets { get; set; }
        public int ActiveUsers { get; set; }
        public IEnumerable<AdoptionRequestDto> RecentRequests { get; set; }
        public int ApprovedAdoptions { get; set; }
        public int TotalAdoptions { get; set; }

        public int TotalUsers { get; set; }
	}
} 