using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetShelter.Migrations
{
    /// <inheritdoc />
    public partial class v15 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ShelterStaff_Users_Id",
                table: "ShelterStaff");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ShelterStaff",
                table: "ShelterStaff");

            migrationBuilder.RenameTable(
                name: "ShelterStaff",
                newName: "Staff");

            migrationBuilder.AddColumn<int>(
                name: "Shelter_FK",
                table: "Staff",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Staff",
                table: "Staff",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "AdoptionRequest",
                columns: table => new
                {
                    AdopterId = table.Column<int>(type: "int", nullable: false),
                    PetId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: true),
                    RequestDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InterviewDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdoptionRequest", x => new { x.PetId, x.AdopterId });
                });

            migrationBuilder.CreateIndex(
                name: "IX_Staff_Shelter_FK",
                table: "Staff",
                column: "Shelter_FK");

            migrationBuilder.AddForeignKey(
                name: "FK_Staff_Shelters_Shelter_FK",
                table: "Staff",
                column: "Shelter_FK",
                principalTable: "Shelters",
                principalColumn: "ShelterID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Staff_Users_Id",
                table: "Staff",
                column: "Id",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Staff_Shelters_Shelter_FK",
                table: "Staff");

            migrationBuilder.DropForeignKey(
                name: "FK_Staff_Users_Id",
                table: "Staff");

            migrationBuilder.DropTable(
                name: "AdoptionRequest");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Staff",
                table: "Staff");

            migrationBuilder.DropIndex(
                name: "IX_Staff_Shelter_FK",
                table: "Staff");

            migrationBuilder.DropColumn(
                name: "Shelter_FK",
                table: "Staff");

            migrationBuilder.RenameTable(
                name: "Staff",
                newName: "ShelterStaff");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ShelterStaff",
                table: "ShelterStaff",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ShelterStaff_Users_Id",
                table: "ShelterStaff",
                column: "Id",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
