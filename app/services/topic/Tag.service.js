const Tag = require('../../models/Tag.model');
const { popularTag, nameTag } = require('../../repository/tag.repository');
const questionRepository = require('../../repository/question.repository');

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

  /**
   * Get questions by tag, ordered by popularity
   * @param {string} tagName - Tag name to filter questions
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 20)
   * @returns {Promise<Object>} { success, data: questions[], pagination }
   */
  static async getQuestionsByTag(tagName, page = 1, limit = 20) {
    try {
      if (!tagName || tagName.trim().length === 0) {
        return {
          success: false,
          message: 'Tag name is required',
        };
      }

      // Normalize tag name to lowercase for case-insensitive matching
      const normalizedTagName = tagName.trim().toLowerCase();

      // Check if tag exists
      const tag = await Tag.findOne({ name: normalizedTagName });
      if (!tag) {
        return {
          success: false,
          message: 'Tag not found',
        };
      }

      // Get questions by tag with pagination
      const { questions, totalCount } =
        await questionRepository.getQuestionsByTag(
          normalizedTagName,
          page,
          limit
        );

      return {
        success: true,
        message: 'Successfully retrieved questions by tag',
        data: questions,
        tag: {
          id: tag._id,
          name: tag.name,
          displayName: tag.displayName,
          questionCount: tag.questionCount,
          description: tag.description,
        },
        pagination: {
          currentPage: page,
          totalCount,
          limit,
        },
      };
    } catch (error) {
      console.error('Get questions by tag error:', error);
      return {
        success: false,
        message: 'Lỗi hệ thống khi lấy danh sách câu hỏi theo tag',
      };
    }
  }
}

module.exports = TagService;
