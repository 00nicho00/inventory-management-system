using InventoryManagement.Core.DTOs;
using InventoryManagement.Core.Entities;
using InventoryManagement.Core.Exceptions;
using InventoryManagement.Core.Interfaces;
using InventoryManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Infrastructure.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
    {
        return await _context.Categories
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto(
                c.Id,
                c.Name,
                c.Description,
                c.Color,
                c.Icon,
                c.Products.Count,
                c.CreatedAt,
                c.UpdatedAt
            ))
            .ToListAsync();
    }

    public async Task<CategoryDto> GetCategoryByIdAsync(int id)
    {
        var category = await _context.Categories
            .AsNoTracking()
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
            throw new NotFoundException($"Category with ID {id} not found.");

        return new CategoryDto(
            category.Id,
            category.Name,
            category.Description,
            category.Color,
            category.Icon,
            category.Products.Count,
            category.CreatedAt,
            category.UpdatedAt
        );
    }

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto)
    {
        var trimmedName = dto.Name.Trim();
        if (string.IsNullOrWhiteSpace(trimmedName))
            throw new ValidationException("Category name is required.");

        var exists = await _context.Categories
            .AnyAsync(c => c.Name.ToLower() == trimmedName.ToLower());

        if (exists)
            throw new ConflictException($"A category named '{trimmedName}' already exists.");

        var category = new Category
        {
            Name = trimmedName,
            Description = dto.Description?.Trim(),
            Color = !string.IsNullOrWhiteSpace(dto.Color) ? dto.Color : "purple",
            Icon = !string.IsNullOrWhiteSpace(dto.Icon) ? dto.Icon : "FolderTree",
            CreatedAt = DateTime.UtcNow
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return new CategoryDto(
            category.Id,
            category.Name,
            category.Description,
            category.Color,
            category.Icon,
            0,
            category.CreatedAt,
            null
        );
    }

    public async Task<CategoryDto> UpdateCategoryAsync(int id, UpdateCategoryDto dto)
    {
        var category = await _context.Categories
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
            throw new NotFoundException($"Category with ID {id} not found.");

        var trimmedName = dto.Name.Trim();
        if (string.IsNullOrWhiteSpace(trimmedName))
            throw new ValidationException("Category name is required.");

        var exists = await _context.Categories
            .AnyAsync(c => c.Id != id && c.Name.ToLower() == trimmedName.ToLower());

        if (exists)
            throw new ConflictException($"A category named '{trimmedName}' already exists.");

        category.Name = trimmedName;
        category.Description = dto.Description?.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Color)) category.Color = dto.Color;
        if (!string.IsNullOrWhiteSpace(dto.Icon)) category.Icon = dto.Icon;
        category.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new CategoryDto(
            category.Id,
            category.Name,
            category.Description,
            category.Color,
            category.Icon,
            category.Products.Count,
            category.CreatedAt,
            category.UpdatedAt
        );
    }

    public async Task DeleteCategoryAsync(int id)
    {
        var category = await _context.Categories
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
            throw new NotFoundException($"Category with ID {id} not found.");

        if (category.Products.Any())
            throw new ConflictException($"Cannot delete category '{category.Name}' because it currently contains {category.Products.Count} product(s). Please delete or reassign the products first.");

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
    }
}

public class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProductDto>> GetProductsAsync(ProductFilterDto filter)
    {
        var query = _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim().ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(search) ||
                p.Sku.ToLower().Contains(search) ||
                (p.Description != null && p.Description.ToLower().Contains(search))
            );
        }

        if (filter.CategoryId.HasValue && filter.CategoryId.Value > 0)
        {
            query = query.Where(p => p.CategoryId == filter.CategoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.StockStatus) && filter.StockStatus != "all")
        {
            switch (filter.StockStatus.ToLower())
            {
                case "in_stock":
                    query = query.Where(p => p.StockQuantity > p.LowStockThreshold);
                    break;
                case "low_stock":
                    query = query.Where(p => p.StockQuantity > 0 && p.StockQuantity <= p.LowStockThreshold);
                    break;
                case "out_of_stock":
                    query = query.Where(p => p.StockQuantity == 0);
                    break;
            }
        }

        return await query
            .OrderBy(p => p.Name)
            .Select(p => new ProductDto(
                p.Id,
                p.Sku,
                p.Name,
                p.Description,
                p.CategoryId,
                p.Category.Name,
                p.Price,
                p.StockQuantity,
                p.LowStockThreshold,
                p.CreatedAt,
                p.UpdatedAt
            ))
            .ToListAsync();
    }

    public async Task<ProductDto> GetProductByIdAsync(int id)
    {
        var product = await _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            throw new NotFoundException($"Product with ID {id} not found.");

        return new ProductDto(
            product.Id,
            product.Sku,
            product.Name,
            product.Description,
            product.CategoryId,
            product.Category.Name,
            product.Price,
            product.StockQuantity,
            product.LowStockThreshold,
            product.CreatedAt,
            product.UpdatedAt
        );
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
    {
        var sku = dto.Sku.Trim().ToUpperInvariant();
        var name = dto.Name.Trim();

        if (string.IsNullOrWhiteSpace(sku)) throw new ValidationException("SKU is required.");
        if (string.IsNullOrWhiteSpace(name)) throw new ValidationException("Product name is required.");
        if (dto.Price < 0) throw new ValidationException("Price cannot be negative.");

        var category = await _context.Categories.FindAsync(dto.CategoryId);
        if (category == null)
            throw new ValidationException($"Category with ID {dto.CategoryId} does not exist.");

        var skuExists = await _context.Products.AnyAsync(p => p.Sku.ToLower() == sku.ToLower());
        if (skuExists)
            throw new ConflictException($"A product with SKU '{sku}' already exists.");

        var initialStock = Math.Max(0, dto.InitialStock ?? 0);
        var lowStockThreshold = Math.Max(0, dto.LowStockThreshold ?? 5);

        var product = new Product
        {
            Sku = sku,
            Name = name,
            Description = dto.Description?.Trim(),
            CategoryId = dto.CategoryId,
            Price = dto.Price,
            StockQuantity = initialStock,
            LowStockThreshold = lowStockThreshold,
            CreatedAt = DateTime.UtcNow
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        // If initial stock was provided, record an initial StockIn movement
        if (initialStock > 0)
        {
            var movement = new StockMovement
            {
                ProductId = product.Id,
                MovementType = MovementType.StockIn,
                Quantity = initialStock,
                BalanceBefore = 0,
                BalanceAfter = initialStock,
                Remarks = "Initial stock intake on product creation",
                Timestamp = DateTime.UtcNow
            };
            _context.StockMovements.Add(movement);
            await _context.SaveChangesAsync();
        }

        return new ProductDto(
            product.Id,
            product.Sku,
            product.Name,
            product.Description,
            product.CategoryId,
            category.Name,
            product.Price,
            product.StockQuantity,
            product.LowStockThreshold,
            product.CreatedAt,
            null
        );
    }

    public async Task<ProductDto> UpdateProductAsync(int id, UpdateProductDto dto)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            throw new NotFoundException($"Product with ID {id} not found.");

        var name = dto.Name.Trim();
        if (string.IsNullOrWhiteSpace(name)) throw new ValidationException("Product name is required.");
        if (dto.Price < 0) throw new ValidationException("Price cannot be negative.");

        var category = await _context.Categories.FindAsync(dto.CategoryId);
        if (category == null)
            throw new ValidationException($"Category with ID {dto.CategoryId} does not exist.");

        product.Name = name;
        product.Description = dto.Description?.Trim();
        product.CategoryId = dto.CategoryId;
        product.Price = dto.Price;
        if (dto.LowStockThreshold.HasValue)
        {
            product.LowStockThreshold = Math.Max(0, dto.LowStockThreshold.Value);
        }
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ProductDto(
            product.Id,
            product.Sku,
            product.Name,
            product.Description,
            product.CategoryId,
            category.Name,
            product.Price,
            product.StockQuantity,
            product.LowStockThreshold,
            product.CreatedAt,
            product.UpdatedAt
        );
    }

    public async Task DeleteProductAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            throw new NotFoundException($"Product with ID {id} not found.");

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
    }
}

public class InventoryService : IInventoryService
{
    private readonly AppDbContext _context;

    public InventoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<StockMovementDto>> GetMovementsAsync(int? productId = null)
    {
        var query = _context.StockMovements
            .AsNoTracking()
            .Include(m => m.Product)
            .AsQueryable();

        if (productId.HasValue && productId.Value > 0)
        {
            query = query.Where(m => m.ProductId == productId.Value);
        }

        return await query
            .OrderByDescending(m => m.Timestamp)
            .Select(m => new StockMovementDto(
                m.Id,
                m.ProductId,
                m.Product.Sku,
                m.Product.Name,
                m.MovementType.ToString(),
                m.Quantity,
                m.BalanceBefore,
                m.BalanceAfter,
                m.Remarks,
                m.Timestamp
            ))
            .ToListAsync();
    }

    public async Task<StockMovementDto> RecordMovementAsync(RecordMovementDto dto)
    {
        if (dto.Quantity <= 0)
            throw new ValidationException("Movement quantity must be greater than zero.");

        if (!Enum.TryParse<MovementType>(dto.MovementType, true, out var movementType))
            throw new ValidationException("Invalid movement type. Must be 'StockIn' or 'StockOut'.");

        // Transactional execution to ensure atomic stock balance updates
        using var transaction = await _context.Database.BeginTransactionAsync();

        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == dto.ProductId);

        if (product == null)
            throw new NotFoundException($"Product with ID {dto.ProductId} not found.");

        var balanceBefore = product.StockQuantity;
        int balanceAfter;

        if (movementType == MovementType.StockIn)
        {
            balanceAfter = balanceBefore + dto.Quantity;
        }
        else // StockOut
        {
            if (balanceBefore < dto.Quantity)
            {
                throw new InsufficientStockException(
                    $"Insufficient stock for '{product.Name}'. Available balance: {balanceBefore}, requested deduction: {dto.Quantity}."
                );
            }
            balanceAfter = balanceBefore - dto.Quantity;
        }

        // Apply new stock balance
        product.StockQuantity = balanceAfter;
        product.UpdatedAt = DateTime.UtcNow;

        var movement = new StockMovement
        {
            ProductId = product.Id,
            MovementType = movementType,
            Quantity = dto.Quantity,
            BalanceBefore = balanceBefore,
            BalanceAfter = balanceAfter,
            Remarks = dto.Remarks?.Trim(),
            Timestamp = DateTime.UtcNow
        };

        _context.StockMovements.Add(movement);
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return new StockMovementDto(
            movement.Id,
            product.Id,
            product.Sku,
            product.Name,
            movement.MovementType.ToString(),
            movement.Quantity,
            movement.BalanceBefore,
            movement.BalanceAfter,
            movement.Remarks,
            movement.Timestamp
        );
    }
}

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync()
    {
        var categories = await _context.Categories.AsNoTracking().ToListAsync();
        var products = await _context.Products.AsNoTracking().ToListAsync();
        var movements = await _context.StockMovements
            .AsNoTracking()
            .Include(m => m.Product)
            .OrderByDescending(m => m.Timestamp)
            .ToListAsync();

        var totalCategories = categories.Count;
        var totalProducts = products.Count;
        var totalStockUnits = products.Sum(p => p.StockQuantity);
        var totalInventoryValue = products.Sum(p => p.StockQuantity * p.Price);

        var lowStockCount = products.Count(p => p.StockQuantity > 0 && p.StockQuantity <= p.LowStockThreshold);
        var outOfStockCount = products.Count(p => p.StockQuantity == 0);

        // StockOut movements calculation (Total units sold and revenue)
        var stockOutMovements = movements.Where(m => m.MovementType == MovementType.StockOut).ToList();
        var totalUnitsSold = stockOutMovements.Sum(m => m.Quantity);

        // Calculate sales by product
        var topSellingProducts = products
            .Select(p =>
            {
                var pMovements = stockOutMovements.Where(m => m.ProductId == p.Id).ToList();
                var unitsSold = pMovements.Sum(m => m.Quantity);
                var revenue = unitsSold * p.Price;
                var catName = categories.FirstOrDefault(c => c.Id == p.CategoryId)?.Name ?? "Uncategorized";

                return new TopSellingProductDto(
                    p.Id,
                    p.Sku,
                    p.Name,
                    p.CategoryId,
                    catName,
                    unitsSold,
                    revenue,
                    p.Price
                );
            })
            .Where(p => p.UnitsSold > 0)
            .OrderByDescending(p => p.UnitsSold)
            .ToList();

        var totalRevenueSold = topSellingProducts.Sum(p => p.TotalRevenue);

        // Category sales summary
        var categorySales = categories
            .Select(c =>
            {
                var catTop = topSellingProducts.Where(p => p.CategoryId == c.Id).ToList();
                return new CategorySalesSummaryDto(
                    c.Id,
                    c.Name,
                    catTop.Sum(p => p.UnitsSold),
                    catTop.Sum(p => p.TotalRevenue)
                );
            })
            .OrderByDescending(c => c.UnitsSold)
            .ToList();

        // Stock distribution by category
        var categoryDistribution = categories
            .Select(c =>
            {
                var catProducts = products.Where(p => p.CategoryId == c.Id).ToList();
                return new CategoryStockDistributionDto(
                    c.Id,
                    c.Name,
                    catProducts.Sum(p => p.StockQuantity),
                    catProducts.Count
                );
            })
            .OrderByDescending(c => c.TotalUnits)
            .ToList();

        var recentMovements = movements
            .Take(6)
            .Select(m => new StockMovementDto(
                m.Id,
                m.ProductId,
                m.Product.Sku,
                m.Product.Name,
                m.MovementType.ToString(),
                m.Quantity,
                m.BalanceBefore,
                m.BalanceAfter,
                m.Remarks,
                m.Timestamp
            ))
            .ToList();

        return new DashboardSummaryDto(
            totalCategories,
            totalProducts,
            totalStockUnits,
            totalInventoryValue,
            totalUnitsSold,
            totalRevenueSold,
            lowStockCount,
            outOfStockCount,
            categoryDistribution,
            topSellingProducts,
            categorySales,
            recentMovements
        );
    }
}
