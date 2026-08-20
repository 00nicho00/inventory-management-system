using FluentAssertions;
using InventoryManagement.Core.DTOs;
using InventoryManagement.Core.Entities;
using InventoryManagement.Core.Exceptions;
using InventoryManagement.Infrastructure.Services;
using Xunit;

namespace InventoryManagement.Tests;

public class CategoryServiceTests
{
    [Fact]
    public async Task CreateCategory_WithValidData_ReturnsCategoryDto()
    {
        // Arrange
        using var context = TestDbContextFactory.Create(nameof(CreateCategory_WithValidData_ReturnsCategoryDto));
        var service = new CategoryService(context);
        var dto = new CreateCategoryDto("Electronics", "Gadgets", "blue", "Laptop");

        // Act
        var result = await service.CreateCategoryAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Electronics");
        result.Color.Should().Be("blue");
        result.Icon.Should().Be("Laptop");
        result.ProductCount.Should().Be(0);
    }

    [Fact]
    public async Task CreateCategory_WithDuplicateName_ThrowsConflictException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create(nameof(CreateCategory_WithDuplicateName_ThrowsConflictException));
        context.Categories.Add(new Category { Name = "Hardware" });
        await context.SaveChangesAsync();

        var service = new CategoryService(context);
        var dto = new CreateCategoryDto("hardware", "Duplicate name check", "purple", "FolderTree");

        // Act & Assert
        await service.Invoking(s => s.CreateCategoryAsync(dto))
            .Should().ThrowAsync<ConflictException>()
            .WithMessage("*already exists*");
    }

    [Fact]
    public async Task DeleteCategory_WhenProductsExist_ThrowsConflictException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create(nameof(DeleteCategory_WhenProductsExist_ThrowsConflictException));
        var category = new Category { Name = "Office" };
        context.Categories.Add(category);
        await context.SaveChangesAsync();

        context.Products.Add(new Product { Sku = "OFF-001", Name = "Desk", CategoryId = category.Id, Price = 100 });
        await context.SaveChangesAsync();

        var service = new CategoryService(context);

        // Act & Assert
        await service.Invoking(s => s.DeleteCategoryAsync(category.Id))
            .Should().ThrowAsync<ConflictException>()
            .WithMessage("*contains*product*");
    }

    [Fact]
    public async Task DeleteCategory_WhenNoProducts_DeletesSuccessfully()
    {
        // Arrange
        using var context = TestDbContextFactory.Create(nameof(DeleteCategory_WhenNoProducts_DeletesSuccessfully));
        var category = new Category { Name = "Temporary" };
        context.Categories.Add(category);
        await context.SaveChangesAsync();

        var service = new CategoryService(context);

        // Act
        await service.DeleteCategoryAsync(category.Id);

        // Assert
        var all = await service.GetAllCategoriesAsync();
        all.Should().BeEmpty();
    }
}
