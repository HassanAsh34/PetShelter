using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetShelter.Migrations
{
    /// <inheritdoc />
    public partial class V2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InterviewDate",
                table: "AdoptionRequest");

            migrationBuilder.CreateTable(
                name: "Interviews",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AdoptionRequest_fk = table.Column<int>(type: "int", nullable: false),
                    InterviewDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Interviews", x => x.id);
                    table.ForeignKey(
                        name: "FK_Interviews_AdoptionRequest_AdoptionRequest_fk",
                        column: x => x.AdoptionRequest_fk,
                        principalTable: "AdoptionRequest",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_AdoptionRequest_fk",
                table: "Interviews",
                column: "AdoptionRequest_fk",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Interviews");

            migrationBuilder.AddColumn<DateTime>(
                name: "InterviewDate",
                table: "AdoptionRequest",
                type: "datetime2",
                nullable: true);
        }
    }
}
