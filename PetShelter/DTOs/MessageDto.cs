namespace PetShelter.DTOs
{
	public class MessageDto
	{
		//int id { get; set; }
		public string SenderEmail { get; set; }

		public string ReceiverEmail { get; set; }

		public List<Message> Messages { get; set; }

		public class Message
		{
			public string Content { get; set; }
			public DateTime Timestamp { get; set; }
		}				
	}
}
