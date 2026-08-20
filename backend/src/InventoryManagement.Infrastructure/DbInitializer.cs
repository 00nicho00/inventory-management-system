using InventoryManagement.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(AppDbContext context)
    {
        // Automatically create schema
        await context.Database.EnsureCreatedAsync();

        // Check if database is already seeded
        if (await context.Categories.AnyAsync())
        {
            return;
        }

        // Seed default categories
        var electronics = new Category
        {
            Name = "Electronics",
            Description = "Gadgets, peripherals, and audio devices",
            Color = "blue",
            Icon = "Laptop",
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        };

        var furniture = new Category
        {
            Name = "Office Furniture",
            Description = "Ergonomic desks, chairs, and mounts",
            Color = "amber",
            Icon = "Armchair",
            CreatedAt = DateTime.UtcNow.AddDays(-9)
        };

        var pantry = new Category
        {
            Name = "Beverages & Pantry",
            Description = "Artisan coffees, teas, and snacks",
            Color = "orange",
            Icon = "Coffee",
            CreatedAt = DateTime.UtcNow.AddDays(-8)
        };

        var cables = new Category
        {
            Name = "Cables & Accessories",
            Description = "High-speed data and charging cords",
            Color = "purple",
            Icon = "Cable",
            CreatedAt = DateTime.UtcNow.AddDays(-7)
        };

        context.Categories.AddRange(electronics, furniture, pantry, cables);
        await context.SaveChangesAsync();

        // Seed default products
        var products = new List<Product>
        {
            new() { Sku = "TECH-001", Name = "Ultra-Slim Mechanical Keyboard (RGB)", Description = "Hot-swappable tactile switches with wireless Bluetooth 5.2", CategoryId = electronics.Id, Price = 119.99m, StockQuantity = 42, LowStockThreshold = 10, CreatedAt = DateTime.UtcNow.AddDays(-10) },
            new() { Sku = "TECH-002", Name = "Precision Wireless Ergonomic Mouse", Description = "4000 DPI sensor with silent click buttons", CategoryId = electronics.Id, Price = 59.50m, StockQuantity = 18, LowStockThreshold = 10, CreatedAt = DateTime.UtcNow.AddDays(-10) },
            new() { Sku = "TECH-003", Name = "27\" 4K UHD IPS Monitor", Description = "144Hz refresh rate, USB-C 90W power delivery", CategoryId = electronics.Id, Price = 349.00m, StockQuantity = 3, LowStockThreshold = 5, CreatedAt = DateTime.UtcNow.AddDays(-10) },
            new() { Sku = "TECH-004", Name = "Noise-Cancelling Over-Ear Headphones", Description = "Active noise cancellation with 35hr battery life", CategoryId = electronics.Id, Price = 199.99m, StockQuantity = 0, LowStockThreshold = 5, CreatedAt = DateTime.UtcNow.AddDays(-10) },
            new() { Sku = "FURN-001", Name = "Ergonomic Mesh Task Chair", Description = "Adjustable lumbar support and 3D armrests", CategoryId = furniture.Id, Price = 289.00m, StockQuantity = 14, LowStockThreshold = 5, CreatedAt = DateTime.UtcNow.AddDays(-9) },
            new() { Sku = "FURN-002", Name = "Electric Dual-Motor Standing Desk", Description = "140x70cm oak tabletop with memory presets", CategoryId = furniture.Id, Price = 449.00m, StockQuantity = 4, LowStockThreshold = 5, CreatedAt = DateTime.UtcNow.AddDays(-9) },
            new() { Sku = "BEV-001", Name = "Artisan Roast Whole Bean Coffee (1kg)", Description = "Single origin Ethiopian Yirgacheffe medium roast", CategoryId = pantry.Id, Price = 24.50m, StockQuantity = 55, LowStockThreshold = 15, CreatedAt = DateTime.UtcNow.AddDays(-8) },
            new() { Sku = "BEV-002", Name = "Organic Japanese Ceremonial Matcha (100g)", Description = "First harvest stone-ground green tea powder", CategoryId = pantry.Id, Price = 32.00m, StockQuantity = 22, LowStockThreshold = 10, CreatedAt = DateTime.UtcNow.AddDays(-8) },
            new() { Sku = "CAB-001", Name = "Braided Thunderbolt 4 Cable (2m)", Description = "40Gbps transfer speed and 100W PD charging", CategoryId = cables.Id, Price = 29.99m, StockQuantity = 68, LowStockThreshold = 20, CreatedAt = DateTime.UtcNow.AddDays(-7) },
            new() { Sku = "CAB-002", Name = "100W GaN 4-Port Fast Charger", Description = "3x USB-C and 1x USB-A ultra-compact travel plug", CategoryId = cables.Id, Price = 49.99m, StockQuantity = 2, LowStockThreshold = 8, CreatedAt = DateTime.UtcNow.AddDays(-7) },
        };

        context.Products.AddRange(products);
        await context.SaveChangesAsync();

        // Seed initial audit trail movements
        var movements = new List<StockMovement>
        {
            new() { ProductId = products[0].Id, MovementType = MovementType.StockIn, Quantity = 50, BalanceBefore = 0, BalanceAfter = 50, Remarks = "Initial supplier restock batch #891", Timestamp = DateTime.UtcNow.AddDays(-6) },
            new() { ProductId = products[0].Id, MovementType = MovementType.StockOut, Quantity = 8, BalanceBefore = 50, BalanceAfter = 42, Remarks = "Sales Order SO-2026-104", Timestamp = DateTime.UtcNow.AddDays(-5) },
            new() { ProductId = products[1].Id, MovementType = MovementType.StockIn, Quantity = 25, BalanceBefore = 0, BalanceAfter = 25, Remarks = "Supplier shipment direct intake", Timestamp = DateTime.UtcNow.AddDays(-5) },
            new() { ProductId = products[1].Id, MovementType = MovementType.StockOut, Quantity = 7, BalanceBefore = 25, BalanceAfter = 18, Remarks = "B2B client bulk purchase", Timestamp = DateTime.UtcNow.AddDays(-4) },
            new() { ProductId = products[6].Id, MovementType = MovementType.StockIn, Quantity = 70, BalanceBefore = 0, BalanceAfter = 70, Remarks = "Monthly pantry bean roast delivery", Timestamp = DateTime.UtcNow.AddDays(-4) },
            new() { ProductId = products[6].Id, MovementType = MovementType.StockOut, Quantity = 15, BalanceBefore = 70, BalanceAfter = 55, Remarks = "Cafeteria stock dispatch", Timestamp = DateTime.UtcNow.AddDays(-3) },
            new() { ProductId = products[8].Id, MovementType = MovementType.StockIn, Quantity = 80, BalanceBefore = 0, BalanceAfter = 80, Remarks = "Accessory container batch intake", Timestamp = DateTime.UtcNow.AddDays(-2) },
            new() { ProductId = products[8].Id, MovementType = MovementType.StockOut, Quantity = 12, BalanceBefore = 80, BalanceAfter = 68, Remarks = "Fulfillment Center replenishment", Timestamp = DateTime.UtcNow.AddDays(-1) },
        };

        context.StockMovements.AddRange(movements);
        await context.SaveChangesAsync();
    }
}
