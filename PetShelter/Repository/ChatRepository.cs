using Microsoft.EntityFrameworkCore;
using PetShelter.Data;
using PetShelter.Models;

namespace PetShelter.Repository
{
	public class ChatRepository
	{
		private readonly Db_Context _context;

		public ChatRepository(Db_Context context)
		{
			_context = context ?? throw new ArgumentNullException(nameof(context));
		}

		
		public async Task<int> SendMessage(MessageModel message)
		{
			_context.Messages.Add(message);
			return await _context.SaveChangesAsync();
		}


		public async Task<List<MessageModel>> GetMessages(string userEmail)
		{
			return await _context.Messages
				.Where(m => m.ReceiverEmail.Contains(userEmail) || m.SenderEmail.Contains(userEmail))
				.ToListAsync();
		}
	}
}
