using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetShelter.Migrations
{
    /// <inheritdoc />
    public partial class v12 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Animals_ShelterCategory_CategoryID",
                table: "Animals");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ShelterCategory",
                table: "ShelterCategory");

            migrationBuilder.RenameTable(
                name: "ShelterCategory",
                newName: "Categories");

            migrationBuilder.RenameColumn(
                name: "CategoryID",
                table: "Animals",
                newName: "Category_FK");

            migrationBuilder.RenameIndex(
                name: "IX_Animals_CategoryID",
                table: "Animals",
                newName: "IX_Animals_Category_FK");

            migrationBuilder.AddColumn<int>(
                name: "Shelter_FK",
                table: "Categories",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Categories",
                table: "Categories",
                column: "CategoryId");

            migrationBuilder.CreateTable(
                name: "Shelters",
                columns: table => new
                {
                    ShelterID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShelterName = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shelters", x => x.ShelterID);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_CategoryName",
                table: "Categories",
                column: "CategoryName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Shelter_FK",
                table: "Categories",
                column: "Shelter_FK");

            migrationBuilder.CreateIndex(
                name: "IX_Shelters_ShelterName",
                table: "Shelters",
                column: "ShelterName",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Animals_Categories_Category_FK",
                table: "Animals",
                column: "Category_FK",
                principalTable: "Categories",
                principalColumn: "CategoryId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_Shelters_Shelter_FK",
                table: "Categories",
                column: "Shelter_FK",
                principalTable: "Shelters",
                principalColumn: "ShelterID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Animals_Categories_Category_FK",
                table: "Animals");

            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Shelters_Shelter_FK",
                table: "Categories");

            migrationBuilder.DropTable(
                name: "Shelters");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Categories",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Categories_CategoryName",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Categories_Shelter_FK",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "Shelter_FK",
                table: "Categories");

            migrationBuilder.RenameTable(
                name: "Categories",
                newName: "ShelterCategory");

            migrationBuilder.RenameColumn(
                name: "Category_FK",
                table: "Animals",
                newName: "CategoryID");

            migrationBuilder.RenameIndex(
                name: "IX_Animals_Category_FK",
                table: "Animals",
                newName: "IX_Animals_CategoryID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ShelterCategory",
                table: "ShelterCategory",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Animals_ShelterCategory_CategoryID",
                table: "Animals",
                column: "CategoryID",
                principalTable: "ShelterCategory",
                principalColumn: "CategoryId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
