using Microsoft.AspNetCore.SignalR;
using PetShelter.DTOs;
using PetShelter.Services;

namespace PetShelter.Hubs
{
    public class DashboardHub : Hub
    {
        private readonly AdminServices _adminServices;

        public DashboardHub(AdminServices adminServices)
        {
            _adminServices = adminServices;
        }

        public async Task UpdateDashboardStats()
        {
            var stats = await _adminServices.GetDashboardStats();
            await Clients.All.SendAsync("ReceiveDashboardUpdate", stats);
        }
    }
} 