using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PetShelter.Convertors;
using PetShelter.Data;
using PetShelter.MiddleWare;
using PetShelter.Repository;
using PetShelter.Services;
using System.Security.Claims;
using System.Text;
using Microsoft.OpenApi.Models;
using System.IdentityModel.Tokens.Jwt;
using PetShelter.Hubs;

public class Program
{
	public static void Main(string[] args)
	{
		var builder = WebApplication.CreateBuilder(args);

		// Add services to the container.
		builder.Services.AddScoped<UserRepository>();
		builder.Services.AddScoped<UserService>();
		builder.Services.AddScoped<AdminRepository>();
		builder.Services.AddScoped<AdminServices>();
		builder.Services.AddScoped<ShelterStaffRepository>();
		builder.Services.AddScoped<ShelterStaffServices>();
		builder.Services.AddScoped<AdoptionRepository>();
		builder.Services.AddScoped<AdoptionServices>();
		//builder.Services.AddScoped<Db_Context>();
		// Configure JWT options
		var configuration = builder.Configuration;
		var tokenOptions = configuration.GetSection("TokenOptions").Get<JWT>();
		if (string.IsNullOrEmpty(tokenOptions.SecretKey))
		{
			throw new ArgumentNullException(nameof(tokenOptions.SecretKey), "Secret key cannot be null or empty.");
		}
		builder.Services.AddSingleton(tokenOptions);

		//for custom serialization
		builder.Services.AddControllers().AddJsonOptions(options =>
		{
			options.JsonSerializerOptions.Converters.Add(new UserConvertor());
			options.JsonSerializerOptions.Converters.Add(new UserDtoCovertor());
		});

		//cors origin
		builder.Services.AddCors(options =>
		{
			options.AddPolicy("AllowFrontend", policy =>
			{
				policy.WithOrigins("http://localhost:3000")  // Frontend is running on port 3000
					  .AllowAnyHeader()
					  .AllowAnyMethod()
					  .AllowCredentials(); // Required for SignalR
			});
		});

		builder.Services.AddControllers();
		builder.Services.AddEndpointsApiExplorer();
		builder.Services.AddSignalR();
		builder.Services.AddSwaggerGen(options =>
		{
			options.AddSecurityDefinition(name: JwtBearerDefaults.AuthenticationScheme, securityScheme: new OpenApiSecurityScheme
			{
				Name = "Authorization",
				Description = "Enter the bearer Authorization `Bearer Generated-JWT-Token`",// to describe for the user how the token works or should be sent
				In = ParameterLocation.Header,//where the token will be coming from
				Type = SecuritySchemeType.ApiKey,
				Scheme = "Bearer"//scheme that it will be statring with Bearer

			});
			options.AddSecurityRequirement(new OpenApiSecurityRequirement
			{
				{
				new OpenApiSecurityScheme
				{
					Reference = new OpenApiReference // refrence to the Brearer scheme
					{
						Type = ReferenceType.SecurityScheme,
						Id = JwtBearerDefaults.AuthenticationScheme
					}
				},
				new string[]{} // represent the string that holds the token
				}
			});
		});
		//builder.Services.AddDbContext<Db_Context>(options => options.UseSqlServer(""));
		builder.Services.AddDbContext<Db_Context>(options => options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));
		// Configure JWT authentication
		var key = Encoding.ASCII.GetBytes(tokenOptions.SecretKey);
		builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
			.AddJwtBearer(options =>
			{
				options.TokenValidationParameters = new TokenValidationParameters
				{
					ValidateIssuer = false,
					ValidateAudience = false,
					ValidateLifetime = true,
					ValidateIssuerSigningKey = true,
					IssuerSigningKey = new SymmetricSecurityKey(key),
					RoleClaimType = ClaimTypes.Role
				};
			});
		JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

		var app = builder.Build();

		// Configure the HTTP request pipeline.
		if (app.Environment.IsDevelopment())
		{
			app.UseSwagger();
            app.UseSwaggerUI();
			
		}
		app.UseCors("AllowFrontend");
		//app.UseCors()
		//app.UseHttpsRedirection();
		app.UseAuthentication();
		app.UseAuthorization();
		app.MapControllers();
		
		// Add SignalR hub endpoints
		app.MapHub<UserNotificationHub>("/userNotificationHub");
		
		app.Run();
	}
}