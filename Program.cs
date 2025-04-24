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


public class Program
{
	public static void Main(string[] args)
	{
		var builder = WebApplication.CreateBuilder(args);

		// Add services to the container.
		builder.Services.AddScoped<UserRepository>();
		builder.Services.AddScoped<UserService>();
		builder.Services.AddScoped <AdminRepository>();
		builder.Services.AddScoped<AdminServices>();
		builder.Services.AddScoped<ShelterStaffRepository>();
		builder.Services.AddScoped<ShelterStaffServices>();
		builder.Services.AddScoped<AdoptionRepository>();
		builder.Services.AddScoped<AdoptionServices>();
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
				policy.WithOrigins("http://localhost:3000") // change this to your frontend's URL
					  .AllowAnyHeader()
					  .AllowAnyMethod();
			});
		});

		builder.Services.AddControllers();
		builder.Services.AddEndpointsApiExplorer();
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
		app.Run();
	}
}