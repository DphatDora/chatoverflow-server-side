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
      const { page, name, limit: queryLimit } = req.query;

      // If name parameter exists, handle search
      if (name) {
        const result = await TagService.searchTagsByName(
          name,
          queryLimit ? parseInt(queryLimit) : 10
        );

        if (!result.success) {
          return res.status(500).json(ApiResponse.error(result.message));
        }

        const tags = TagResponseDto.fromTagList(result.data);

        return res.status(200).json(ApiResponse.success(result.message, tags));
      }

      // Otherwise handle pagination
      const pageNum = parseInt(page) || 1;
      const limit = queryLimit ? parseInt(queryLimit) : 10;
      const result = await TagService.getPopularTags(pageNum, limit);

      if (!result.success) {
        return res.status(500).json(ApiResponse.error(result.message));
      }

      const tags = TagResponseDto.fromTagList(result.data);
      const { currentPage, totalCount } = result.pagination;
      const baseUrl = '/tag';

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
}

module.exports = TagController;
