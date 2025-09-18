const userRepository = require('../../repository/user.repository');
const USER_FILTERS = require('../../constants/filters/user');

async function getUsers(page = 1, limit = 12, filter, search = '') {
  let sortStage = {};

  switch (filter) {
    case USER_FILTERS.MOST_QUESTIONS:
      sortStage = { questionsCount: -1 };
      break;
    case USER_FILTERS.MOST_ANSWERS:
      sortStage = { answersCount: -1 };
      break;
    case USER_FILTERS.RECENTLY_ACTIVE:
      sortStage = { createdAt: -1 };
      break;
    default:
      sortStage = { questionsCount: -1 };
  }

  const users = await userRepository.aggregateUsers({
    page,
    limit,
    sortStage,
    search,
  });

  const totalUsers = await userRepository.countUsers(search);

  return { users, totalUsers };
}

module.exports = {
  getUsers,
};
