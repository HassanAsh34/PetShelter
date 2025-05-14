using Microsoft.AspNetCore.SignalR;
using PetShelter.Hubs;
using PetShelter.DTOs;

namespace PetShelter.Services
{
    public abstract class BaseService
    {
        protected readonly IHubContext<DashboardHub> _hubContext;

        protected BaseService(IHubContext<DashboardHub> hubContext)
        {
            _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
        }

        protected async Task NotifyDashboardUpdate(DashboardStatsDto stats)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveDashboardUpdate", stats);
        }
    }
} 