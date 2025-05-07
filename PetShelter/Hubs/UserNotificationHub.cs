using Microsoft.AspNetCore.SignalR;
using PetShelter.DTOs;
using System.Threading.Tasks;

namespace PetShelter.Hubs
{
    public class UserNotificationHub : Hub
    {
        public async Task NotifyNewUserRegistration(UserDto newUser)
        {
            // Send to all admin clients
            await Clients.Group("Admins").SendAsync("ReceiveNewUserRegistration", newUser);
        }

        public async Task JoinAdminGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        }
    }
} 