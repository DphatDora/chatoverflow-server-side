const Tag = require('../../models/Tag.model');
const { popularTag, nameTag } = require('../../repository/tag.repository');

class TagService {
  /**
   * Get popular tags with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 12)
   * @returns {Promise<Object>} { success, data: { tags, totalCount, totalPages, currentPage } }
   */
  static async getPopularTags(page = 1, limit = 12) {
    try {
      const skip = (page - 1) * limit;

      // Get tags sorted by question count (most popular first)
      const tags = await popularTag(skip, limit);

      // Get total count for pagination
      const totalCount = await Tag.countDocuments();

      return {
        success: true,
        message: 'Successfully retrieved tags',
        data: tags,
        pagination: {
          currentPage: page,
          totalCount,
          limit,
        },
      };
    } catch (error) {
      console.error('Get popular tags error:', error);
      return {
        success: false,
        message: 'Lỗi hệ thống khi lấy danh sách tags',
      };
    }
  }

  /**
   * Search tags by name (for autocomplete)
   * @param {string} searchTerm - Search term
   * @param {number} limit - Max results (default: 10)
   * @returns {Promise<Object>} { success, data: tags[] }
   */
  static async searchTagsByName(searchTerm, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      if (!searchTerm || searchTerm.trim().length < 1) {
        return {
          success: true,
          message: 'Danh sách tags theo tìm kiếm',
          data: [],
        };
      }

      const searchRegex = new RegExp(searchTerm.trim(), 'i');

      const { items, totalCount } = await nameTag(
        searchTerm,
        searchRegex,
        skip,
        limit
      );
      console.log(items);

      return {
        success: true,
        message: 'Successfully retrieved tags',
        data: items,
        pagination: {
          currentPage: page,
          totalCount,
          limit,
        },
      };
    } catch (error) {
      console.error('Search tags error:', error);
      return {
        success: false,
        message: 'Lỗi hệ thống khi tìm kiếm tags',
      };
    }
  }
}

module.exports = TagService;
