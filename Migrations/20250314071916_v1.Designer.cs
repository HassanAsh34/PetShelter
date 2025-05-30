﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using PetShelter.Data;

#nullable disable

namespace PetShelter.Migrations
{
    [DbContext(typeof(Db_Context))]
    [Migration("20250314071916_v1")]
    partial class v1
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.2")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("PetShelter.Models.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<bool>("Activated")
                        .HasColumnType("bit");

                    b.Property<DateTime>("ActivatedAt")
                        .HasColumnType("datetime2");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)");

                    b.Property<string>("Password")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)");

                    b.Property<int>("Role")
                        .HasColumnType("int");

                    b.Property<string>("Uname")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("nvarchar(50)");

                    b.Property<DateTime>("UpdatedAt")
                        .HasColumnType("datetime2");

                    b.HasKey("Id");

                    b.ToTable("Users", (string)null);

                    b.UseTptMappingStrategy();
                });

            modelBuilder.Entity("PetShelter.Models.Admin", b =>
                {
                    b.HasBaseType("PetShelter.Models.User");

                    b.Property<string>("AdminType")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.ToTable("Admins", (string)null);
                });

            modelBuilder.Entity("PetShelter.Models.Adopter", b =>
                {
                    b.HasBaseType("PetShelter.Models.User");

                    b.Property<string>("Address")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)");

                    b.Property<string>("Phone")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.ToTable("Adopters", (string)null);
                });

            modelBuilder.Entity("PetShelter.Models.Admin", b =>
                {
                    b.HasOne("PetShelter.Models.User", null)
                        .WithOne()
                        .HasForeignKey("PetShelter.Models.Admin", "Id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("PetShelter.Models.Adopter", b =>
                {
                    b.HasOne("PetShelter.Models.User", null)
                        .WithOne()
                        .HasForeignKey("PetShelter.Models.Adopter", "Id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });
#pragma warning restore 612, 618
        }
    }
}
