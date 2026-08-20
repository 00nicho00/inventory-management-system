using FluentAssertions;
using InventoryManagement.Core.DTOs;
using InventoryManagement.Core.Entities;
using InventoryManagement.Core.Exceptions;
using InventoryManagement.Infrastructure.Services;
using Xunit;

namespace InventoryManagement.Tests;

public class InventoryServiceTests
{
    [Fact]
    public async Task RecordMovement_StockIn_IncreasesStockAndLogsAuditTrail()
    {
        // Arrange
        using var context = TestDbContextFactory.Create(nameof(RecordMovement_StockIn_IncreasesStockAndLogsAuditTrail));
        var category = new Category { Name = "Supplies" };
        context.Categories.Add(category);
        var product = new Product { Sku = "SUP-01", Name = "Paper", CategoryId = category.Id, Price = 10, StockQuantity = 20 };
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var service = new InventoryService(context);
        var dto = new RecordMovementDto(product.Id, "StockIn", 15, "Supplier Restock");

        // Act
        var result = await service.RecordMovementAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.MovementType.Should().Be("StockIn");
        result.Quantity.Should().Be(15);
        result.BalanceBefore.Should().Be(20);
        result.BalanceAfter.Should().Be(35);

        // Verify product balance was updated
        var updatedProduct = await context.Products.FindAsync(product.Id);
        updatedProduct!.StockQuantity.Should().Be(35);
    }

    [Fact]
    public async Task RecordMovement_StockOut_WhenStockSufficient_DeductsBalance()
    {
        // Arrange
        using var context = TestDbContextFactory.Create(nameof(RecordMovement_StockOut_WhenStockSufficient_DeductsBalance));
        var category = new Category { Name = "Food" };
        context.Categories.Add(category);
        var product = new Product { Sku = "FOOD-01", Name = "Coffee", CategoryId = category.Id, Price = 25, StockQuantity = 50 };
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var service = new InventoryService(context);
        var dto = new RecordMovementDto(product.Id, "StockOut", 20, "Sales Order #100");

        // Act
        var result = await service.RecordMovementAsync(dto);

        // Assert
        result.BalanceBefore.Should().Be(50);
        result.BalanceAfter.Should().Be(30);

        var updatedProduct = await context.Products.FindAsync(product.Id);
        updatedProduct!.StockQuantity.Should().Be(30);
    }

    [Fact]
    public async Task RecordMovement_StockOut_WhenStockInsufficient_ThrowsInsufficientStockException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create(nameof(RecordMovement_StockOut_WhenStockInsufficient_ThrowsInsufficientStockException));
        var category = new Category { Name = "Gadgets" };
        context.Categories.Add(category);
        var product = new Product { Sku = "GAD-01", Name = "Tablet", CategoryId = category.Id, Price = 300, StockQuantity = 5 };
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var service = new InventoryService(context);
        var dto = new RecordMovementDto(product.Id, "StockOut", 10, "Attempted Over-dispatch");

        // Act & Assert (Negative balance protection test)
        await service.Invoking(s => s.RecordMovementAsync(dto))
            .Should().ThrowAsync<InsufficientStockException>()
            .WithMessage("*Insufficient stock*");

        // Ensure stock quantity was not modified
        var intactProduct = await context.Products.FindAsync(product.Id);
        intactProduct!.StockQuantity.Should().Be(5);
    }

    [Fact]
    public async Task RecordMovement_WithInvalidQuantity_ThrowsValidationException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create(nameof(RecordMovement_WithInvalidQuantity_ThrowsValidationException));
        var service = new InventoryService(context);
        var dto = new RecordMovementDto(1, "StockIn", 0, "Invalid zero qty");

        // Act & Assert
        await service.Invoking(s => s.RecordMovementAsync(dto))
            .Should().ThrowAsync<ValidationException>()
            .WithMessage("*greater than zero*");
    }
}
