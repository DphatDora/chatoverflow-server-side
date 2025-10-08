const TagService = require('../../services/topic/Tag.service');
const TagResponseDto = require('../../dto/res/tag.response');
const ApiResponse = require('../../dto/res/api.response');

class TagController {
  /**
   * GET /api/tag?page=1&name=searchTerm
   * Handle both pagination and search based on query params
   */
  static async getTags(req, res) {
    try {
      // Parse query params
      const page = parseInt(req.query.page, 10) || 1;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
      const name = req.query.name?.trim();

      let result;

      // If `name` exists → search
      if (name) {
        result = await TagService.searchTagsByName(name, page, limit);
      } else {
        // Otherwise → popular tags
        result = await TagService.getPopularTags(page, limit);
      }

      // Handle error from service
      if (!result.success) {
        return res.status(500).json(ApiResponse.error(result.message));
      }

      // Map DTOs
      const tags = TagResponseDto.fromTagList(result.data);

      // Pagination info
      const { currentPage, totalCount } = result.pagination;
      const baseUrl = name ? `/tag?name=${encodeURIComponent(name)}` : '/tag';

      // Build response
      return res
        .status(200)
        .json(
          ApiResponse.withPagination(
            result.message,
            tags,
            currentPage,
            limit,
            baseUrl,
            totalCount
          )
        );
    } catch (error) {
      console.error('Get tags controller error:', error);
      return res
        .status(500)
        .json(ApiResponse.error('Lỗi hệ thống khi xử lý yêu cầu tags'));
    }
  }

  /**
   * POST /api/tag/sync (Admin only - for syncing tags from questions)
   */
  static async syncTags(req, res) {
    try {
      const result = await TagService.syncTagsFromQuestions();

      if (!result.success) {
        return res.status(500).json(ApiResponse.error(result.message));
      }

      return res
        .status(200)
        .json(ApiResponse.success(result.message, result.data));
    } catch (error) {
      console.error('Sync tags controller error:', error);
      return res
        .status(500)
        .json(ApiResponse.error('Lỗi hệ thống khi đồng bộ tags'));
    }
  }

  /**
   * GET /api/tag/:tagName/questions?page=1&limit=20
   * Get questions by tag, ordered by popularity
   */
  static async getQuestionsByTag(req, res) {
    try {
      const { tagName } = req.params;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;

      if (!tagName) {
        return res.status(400).json(ApiResponse.error('Tag name is required'));
      }

      const result = await TagService.getQuestionsByTag(tagName, page, limit);

      if (!result.success) {
        return res.status(404).json(ApiResponse.error(result.message));
      }

      const { currentPage, totalCount } = result.pagination;
      const baseUrl = `/tag/${encodeURIComponent(tagName)}/questions`;

      return res.status(200).json(
        ApiResponse.withPagination(
          result.message,
          {
            questions: result.data,
            tag: result.tag,
          },
          currentPage,
          limit,
          baseUrl,
          totalCount
        )
      );
    } catch (error) {
      console.error('Get questions by tag controller error:', error);
      return res
        .status(500)
        .json(ApiResponse.error('Lỗi hệ thống khi xử lý yêu cầu'));
    }
  }
}

module.exports = TagController;
