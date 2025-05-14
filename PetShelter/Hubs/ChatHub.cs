using Microsoft.AspNetCore.SignalR;
using PetShelter.DTOs;
using PetShelter.Models;
using PetShelter.Services;

namespace PetShelter.Hubs
{
	public class ChatHub : Hub
	{
		private readonly ChatServices _chatServices;
		private const string ADMIN_EMAIL = "Admin@shelter.com";

		public ChatHub(ChatServices chatServices)
		{
			_chatServices = chatServices ?? throw new ArgumentNullException(nameof(chatServices));
		}

		public override async Task OnConnectedAsync()
		{
			await base.OnConnectedAsync();
		}

		public async Task SendMessage(MessageModel message)
		{
			try
			{
				if (string.IsNullOrEmpty(message.SenderEmail))
				{
					throw new HubException("Sender email is required.");
				}

				bool success = await _chatServices.SendMessage(message);

				if (success)
				{
					// After sending, update messages for both sender and receiver
					var senderMessages = await _chatServices.ReceiveMessage(message.SenderEmail);
					var receiverMessages = await _chatServices.ReceiveMessage(message.ReceiverEmail);

					// Send updated messages to both users
					await Clients.Group(message.SenderEmail.ToLower()).SendAsync("UpdateMessages", senderMessages);
					await Clients.Group(message.ReceiverEmail.ToLower()).SendAsync("UpdateMessages", receiverMessages);
				}
				else
				{
					throw new HubException("Failed to send message");
				}
			}
			catch (Exception ex)
			{
				throw new HubException($"Error sending message: {ex.Message}");
			}
		}

		public async Task GetMessages(string email)
		{
			try
			{
				if (string.IsNullOrEmpty(email))
				{
					throw new HubException("Email is required.");
				}

				// Add user to their group if not already added
				await Groups.AddToGroupAsync(Context.ConnectionId, email.ToLower());

				var messages = await _chatServices.ReceiveMessage(email);
				await Clients.Caller.SendAsync("UpdateMessages", messages);
			}
			catch (Exception ex)
			{
				throw new HubException($"Error getting messages: {ex.Message}");
			}
		}
	}
}
