using PetShelter.DTOs;
using PetShelter.Models;
using PetShelter.Repository;
using static PetShelter.DTOs.MessageDto;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace PetShelter.Services
{
	public class ChatServices
	{
		private readonly ChatRepository _chatRepository;

		public ChatServices(ChatRepository chatRepository)
		{
			_chatRepository = chatRepository ?? throw new ArgumentNullException(nameof(chatRepository));
		}
		public async Task<bool> SendMessage(MessageModel message)
		{
			if(await _chatRepository.SendMessage(message) > 0)
			{
				return true;
			}
			return false;
		}

		public async Task<IEnumerable<MessageDto>> ReceiveMessage(string userEmail)
		{
			List<MessageModel> messages = await _chatRepository.GetMessages(userEmail);
			if (messages == null || messages.Count == 0)
				return new List<MessageDto>();

			// Group messages by conversation pairs
			var messageGroups = messages
				.GroupBy(m => new { 
					SenderEmail = m.SenderEmail.ToLower(), 
					ReceiverEmail = m.ReceiverEmail.ToLower() 
				})
				.Select(g => new MessageDto
				{
					SenderEmail = g.Key.SenderEmail,
					ReceiverEmail = g.Key.ReceiverEmail,
					Messages = g.Select(m => new MessageDto.Message
					{
						Content = m.Message,
						Timestamp = m.Timestamp
					})
					.OrderBy(m => m.Timestamp)
					.ToList()
				})
				.ToList();

			return messageGroups;
		}

	}
}
