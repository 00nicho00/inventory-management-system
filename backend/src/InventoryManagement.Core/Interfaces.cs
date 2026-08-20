using InventoryManagement.Core.DTOs;

namespace InventoryManagement.Core.Interfaces;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();
    Task<CategoryDto> GetCategoryByIdAsync(int id);
    Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto);
    Task<CategoryDto> UpdateCategoryAsync(int id, UpdateCategoryDto dto);
    Task DeleteCategoryAsync(int id);
}

public interface IProductService
{
    Task<IEnumerable<ProductDto>> GetProductsAsync(ProductFilterDto filter);
    Task<ProductDto> GetProductByIdAsync(int id);
    Task<ProductDto> CreateProductAsync(CreateProductDto dto);
    Task<ProductDto> UpdateProductAsync(int id, UpdateProductDto dto);
    Task DeleteProductAsync(int id);
}

public interface IInventoryService
{
    Task<IEnumerable<StockMovementDto>> GetMovementsAsync(int? productId = null);
    Task<StockMovementDto> RecordMovementAsync(RecordMovementDto dto);
}

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetDashboardSummaryAsync();
}
