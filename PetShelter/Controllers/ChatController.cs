using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using PetShelter.DTOs;
using PetShelter.Hubs;
using PetShelter.Models;
using PetShelter.Services;

namespace PetShelter.Controllers
{
	[ApiController]
	[Route("/Chat")]
	public class ChatController : ControllerBase
	{
		private readonly ChatServices _chatServices;
		private readonly IHubContext<ChatHub> _chatHub;
		private const string ADMIN_EMAIL = "Admin@shelter.com";

		public ChatController(ChatServices chatServices, IHubContext<ChatHub> chatHub)
		{
			_chatServices = chatServices ?? throw new ArgumentNullException(nameof(chatServices));
			_chatHub = chatHub ?? throw new ArgumentNullException(nameof(chatHub));
		}

		[Authorize]
		[HttpPost("sendMessage")]
		public async Task<IActionResult> SendMessage([FromBody] MessageModel message)
		{
			message.SenderEmail = User.FindFirst(ClaimTypes.Email)?.Value;
			Console.WriteLine($"Sending message from {message.SenderEmail} to {message.ReceiverEmail}");
			
			bool res = await _chatServices.SendMessage(message);
			if(res)
			{
				// Send to receiver's group
				await _chatHub.Clients.Group(message.ReceiverEmail.ToLower()).SendAsync("ReceiveMessage", message);
				
				// If admin is involved, send directly to admin email
				if (message.SenderEmail.Equals(ADMIN_EMAIL, StringComparison.OrdinalIgnoreCase) || 
					message.ReceiverEmail.Equals(ADMIN_EMAIL, StringComparison.OrdinalIgnoreCase))
				{
					await _chatHub.Clients.Group(ADMIN_EMAIL.ToLower()).SendAsync("ReceiveMessage", message);
				}

				// Send updated message list to both sender and receiver
				var senderMessages = await _chatServices.ReceiveMessage(message.SenderEmail);
				var receiverMessages = await _chatServices.ReceiveMessage(message.ReceiverEmail);

				await _chatHub.Clients.Group(message.SenderEmail.ToLower()).SendAsync("UpdateMessages", senderMessages);
				await _chatHub.Clients.Group(message.ReceiverEmail.ToLower()).SendAsync("UpdateMessages", receiverMessages);

				return Ok(new { message = "Message successfully sent" });
			}
			else
			{
				return BadRequest(new { message = "message not sent" });
			}
		}

		[Authorize]
		[HttpGet("GetChats")]
		public async Task<IEnumerable<MessageDto>> getMessages()
		{
			string email = User.FindFirst(ClaimTypes.Email)?.Value;
			if (email == null)
				throw new ArgumentNullException(nameof(email));
			return await _chatServices.ReceiveMessage(email);
		}
		
	}
}

