// Email templates for notifications
const generateEmailContent = (action, payload, user) => {
  const userName = user.name || user.nickName || 'bạn';

  const templates = {
    new_answer: {
      subject: 'Có câu trả lời mới cho câu hỏi của bạn',
      html: `
        <h3>Xin chào ${userName}!</h3>
        <p>Có người vừa trả lời câu hỏi "<strong>${payload.questionTitle}</strong>" của bạn.</p>
        <blockquote style="background: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0;">
          ${payload.answerContent}
        </blockquote>
        <p>Bạn có thể xem chi tiết tại: <a href="${payload.questionUrl}">Xem câu trả lời</a></p>
        <p><small>Đây là email tự động, vui lòng không trả lời.</small></p>
      `,
    },
    question_upvote: {
      subject: 'Câu hỏi của bạn nhận được upvote',
      html: `
        <h3>Xin chào ${userName}!</h3>
        <p>Câu hỏi "<strong>${payload.questionTitle}</strong>" của bạn vừa nhận được một upvote! 👍</p>
        <p>Tổng số upvotes hiện tại: <strong>${payload.totalUpvotes}</strong></p>
        <p><a href="${payload.questionUrl}">Xem câu hỏi</a></p>
        <p><small>Đây là email tự động, vui lòng không trả lời.</small></p>
      `,
    },
    question_downvote: {
      subject: 'Câu hỏi của bạn nhận được downvote',
      html: `
        <h3>Xin chào ${userName}!</h3>
        <p>Câu hỏi "<strong>${payload.questionTitle}</strong>" của bạn vừa nhận được một downvote.</p>
        <p>Tổng số downvotes hiện tại: <strong>${payload.totalDownvotes}</strong></p>
        <p><a href="${payload.questionUrl}">Xem câu hỏi</a></p>
        <p><small>Đây là email tự động, vui lòng không trả lời.</small></p>
      `,
    },
    answer_upvote: {
      subject: 'Câu trả lời của bạn nhận được upvote',
      html: `
        <h3>Xin chào ${userName}!</h3>
        <p>Câu trả lời của bạn cho câu hỏi "<strong>${payload.questionTitle}</strong>" vừa nhận được một upvote! 👍</p>
        <p>Tổng số upvotes hiện tại: <strong>${payload.totalUpvotes}</strong></p>
        <p><a href="${payload.answerUrl}">Xem câu trả lời</a></p>
        <p><small>Đây là email tự động, vui lòng không trả lời.</small></p>
      `,
    },
    answer_downvote: {
      subject: 'Câu trả lời của bạn nhận được downvote',
      html: `
        <h3>Xin chào ${userName}!</h3>
        <p>Câu trả lời của bạn cho câu hỏi "<strong>${payload.questionTitle}</strong>" vừa nhận được một downvote.</p>
        <p>Tổng số downvotes hiện tại: <strong>${payload.totalDownvotes}</strong></p>
        <p><a href="${payload.answerUrl}">Xem câu trả lời</a></p>
        <p><small>Đây là email tự động, vui lòng không trả lời.</small></p>
      `,
    },
    new_blog_comment: {
      subject: 'Có bình luận mới cho blog của bạn',
      html: `
        <h3>Xin chào ${userName}!</h3>
        <p>Có người vừa bình luận về blog "<strong>${payload.blogTitle}</strong>" của bạn.</p>
        <blockquote style="background: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0;">
          ${payload.commentContent}
        </blockquote>
        <p>Bạn có thể xem chi tiết tại: <a href="${payload.blogUrl}">Xem blog</a></p>
        <p><small>Đây là email tự động, vui lòng không trả lời.</small></p>
      `,
    },
    blog_upvote: {
      subject: 'Blog của bạn nhận được upvote',
      html: `
        <h3>Xin chào ${userName}!</h3>
        <p>Blog "<strong>${payload.blogTitle}</strong>" của bạn vừa nhận được một upvote! 👍</p>
        <p>Tổng số upvotes hiện tại: <strong>${payload.totalUpvotes}</strong></p>
        <p><a href="${payload.blogUrl}">Xem blog</a></p>
        <p><small>Đây là email tự động, vui lòng không trả lời.</small></p>
      `,
    },
    blog_comment_upvote: {
      subject: 'Bình luận blog của bạn nhận được upvote',
      html: `
        <h3>Xin chào ${userName}!</h3>
        <p>Bình luận của bạn về blog "<strong>${payload.blogTitle}</strong>" vừa nhận được một upvote! 👍</p>
        <p>Tổng số upvotes hiện tại: <strong>${payload.totalUpvotes}</strong></p>
        <p><a href="${payload.commentUrl}">Xem bình luận</a></p>
        <p><small>Đây là email tự động, vui lòng không trả lời.</small></p>
      `,
    },
  };

  return (
    templates[action] || {
      subject: 'Thông báo từ ChatOverflow',
      html: `
      <h3>Xin chào ${userName}!</h3>
      <p>Bạn có thông báo mới từ ChatOverflow.</p>
      <p><small>Đây là email tự động, vui lòng không trả lời.</small></p>
    `,
    }
  );
};

module.exports = { generateEmailContent };
