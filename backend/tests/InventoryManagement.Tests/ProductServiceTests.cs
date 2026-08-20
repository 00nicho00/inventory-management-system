using FluentAssertions;
using InventoryManagement.Core.DTOs;
using InventoryManagement.Core.Entities;
using InventoryManagement.Core.Exceptions;
using InventoryManagement.Infrastructure.Services;
using Xunit;

namespace InventoryManagement.Tests;

public class ProductServiceTests
{
    [Fact]
    public async Task CreateProduct_WithValidDataAndInitialStock_CreatesProductAndStockInRecord()
    {
        // Arrange
        using var context = TestDbContextFactory.Create(nameof(CreateProduct_WithValidDataAndInitialStock_CreatesProductAndStockInRecord));
        var category = new Category { Name = "Tech" };
        context.Categories.Add(category);
        await context.SaveChangesAsync();

        var service = new ProductService(context);
        var dto = new CreateProductDto(
            Sku: "TECH-101",
            Name: "Mechanical Keyboard",
            Description: "RGB Keyboard",
            CategoryId: category.Id,
            Price: 150.00m,
            InitialStock: 25,
            LowStockThreshold: 5
        );

        // Act
        var result = await service.CreateProductAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.Sku.Should().Be("TECH-101");
        result.StockQuantity.Should().Be(25);

        // Verify initial StockIn audit log was created
        var movement = context.StockMovements.FirstOrDefault(m => m.ProductId == result.Id);
        movement.Should().NotBeNull();
        movement!.MovementType.Should().Be(MovementType.StockIn);
        movement.Quantity.Should().Be(25);
        movement.BalanceAfter.Should().Be(25);
    }

    [Fact]
    public async Task CreateProduct_WithDuplicateSku_ThrowsConflictException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create(nameof(CreateProduct_WithDuplicateSku_ThrowsConflictException));
        var category = new Category { Name = "Audio" };
        context.Categories.Add(category);
        context.Products.Add(new Product { Sku = "AUD-001", Name = "Headphones", CategoryId = category.Id, Price = 99 });
        await context.SaveChangesAsync();

        var service = new ProductService(context);
        var dto = new CreateProductDto("aud-001", "Duplicate SKU Item", null, category.Id, 120, 10, 5);

        // Act & Assert
        await service.Invoking(s => s.CreateProductAsync(dto))
            .Should().ThrowAsync<ConflictException>()
            .WithMessage("*already exists*");
    }

    [Fact]
    public async Task CreateProduct_WithNonExistentCategory_ThrowsValidationException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create(nameof(CreateProduct_WithNonExistentCategory_ThrowsValidationException));
        var service = new ProductService(context);
        var dto = new CreateProductDto("SKU-999", "Orphan Product", null, 9999, 50, 0, 5);

        // Act & Assert
        await service.Invoking(s => s.CreateProductAsync(dto))
            .Should().ThrowAsync<ValidationException>()
            .WithMessage("*does not exist*");
    }
}
