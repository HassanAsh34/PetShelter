using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetShelter.Migrations
{
    /// <inheritdoc />
    public partial class v16 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_AdoptionRequest",
                table: "AdoptionRequest");

            migrationBuilder.RenameTable(
                name: "AdoptionRequest",
                newName: "AdoptionRequests");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AdoptionRequests",
                table: "AdoptionRequests",
                columns: new[] { "PetId", "AdopterId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_AdoptionRequests",
                table: "AdoptionRequests");

            migrationBuilder.RenameTable(
                name: "AdoptionRequests",
                newName: "AdoptionRequest");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AdoptionRequest",
                table: "AdoptionRequest",
                columns: new[] { "PetId", "AdopterId" });
        }
    }
}
