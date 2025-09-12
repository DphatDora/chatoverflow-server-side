const { getUsers } = require('../../services/user/UserGet.service');
const ApiResponse = require('../../dto/res/api.response');

exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const { filter, search } = req.query; // <-- thêm search

    const { users, totalUsers } = await getUsers(page, limit, filter, search);

    return res.json(
      ApiResponse.withPagination(
        'Fetched users successfully',
        users,
        page,
        limit,
        `${process.env.BACKEND_BASE_URL}/user`,
        totalUsers
      )
    );
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json(ApiResponse.error('Server error'));
  }
};
