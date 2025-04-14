using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetShelter.Migrations
{
    /// <inheritdoc />
    public partial class v11 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Animals_ShelterCategory_category_id",
                table: "Animals");

            migrationBuilder.DropIndex(
                name: "IX_Animals_category_id",
                table: "Animals");

            migrationBuilder.DropColumn(
                name: "category_id",
                table: "Animals");

            migrationBuilder.CreateIndex(
                name: "IX_Animals_CategoryID",
                table: "Animals",
                column: "CategoryID");

            migrationBuilder.AddForeignKey(
                name: "FK_Animals_ShelterCategory_CategoryID",
                table: "Animals",
                column: "CategoryID",
                principalTable: "ShelterCategory",
                principalColumn: "CategoryId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Animals_ShelterCategory_CategoryID",
                table: "Animals");

            migrationBuilder.DropIndex(
                name: "IX_Animals_CategoryID",
                table: "Animals");

            migrationBuilder.AddColumn<int>(
                name: "category_id",
                table: "Animals",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Animals_category_id",
                table: "Animals",
                column: "category_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Animals_ShelterCategory_category_id",
                table: "Animals",
                column: "category_id",
                principalTable: "ShelterCategory",
                principalColumn: "CategoryId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
