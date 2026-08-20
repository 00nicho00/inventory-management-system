namespace InventoryManagement.Core.DTOs;

public record CategoryDto(
    int Id,
    string Name,
    string? Description,
    string Color,
    string Icon,
    int ProductCount,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record CreateCategoryDto(
    string Name,
    string? Description,
    string? Color,
    string? Icon
);

public record UpdateCategoryDto(
    string Name,
    string? Description,
    string? Color,
    string? Icon
);

public record ProductDto(
    int Id,
    string Sku,
    string Name,
    string? Description,
    int CategoryId,
    string CategoryName,
    decimal Price,
    int StockQuantity,
    int LowStockThreshold,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record CreateProductDto(
    string Sku,
    string Name,
    string? Description,
    int CategoryId,
    decimal Price,
    int? InitialStock,
    int? LowStockThreshold
);

public record UpdateProductDto(
    string Name,
    string? Description,
    int CategoryId,
    decimal Price,
    int? LowStockThreshold
);

public record ProductFilterDto(
    string? Search,
    int? CategoryId,
    string? StockStatus // "all", "in_stock", "low_stock", "out_of_stock"
);

public record StockMovementDto(
    int Id,
    int ProductId,
    string ProductSku,
    string ProductName,
    string MovementType, // "StockIn" | "StockOut"
    int Quantity,
    int BalanceBefore,
    int BalanceAfter,
    string? Remarks,
    DateTime Timestamp
);

public record RecordMovementDto(
    int ProductId,
    string MovementType, // "StockIn" | "StockOut"
    int Quantity,
    string? Remarks
);

public record CategoryStockDistributionDto(
    int CategoryId,
    string CategoryName,
    int TotalUnits,
    int ProductCount
);

public record TopSellingProductDto(
    int ProductId,
    string ProductSku,
    string ProductName,
    int CategoryId,
    string CategoryName,
    int UnitsSold,
    decimal TotalRevenue,
    decimal Price
);

public record CategorySalesSummaryDto(
    int CategoryId,
    string CategoryName,
    int UnitsSold,
    decimal TotalRevenue
);

public record DashboardSummaryDto(
    int TotalCategories,
    int TotalProducts,
    int TotalStockUnits,
    decimal TotalInventoryValue,
    int TotalUnitsSold,
    decimal TotalRevenueSold,
    int LowStockCount,
    int OutOfStockCount,
    List<CategoryStockDistributionDto> CategoryDistribution,
    List<TopSellingProductDto> TopSellingProducts,
    List<CategorySalesSummaryDto> CategorySales,
    List<StockMovementDto> RecentMovements
);
