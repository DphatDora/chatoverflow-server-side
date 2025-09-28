# Triển khai Notification System cho Blog

## Tổng quan

Đã tích hợp hệ thống notification email cho các hoạt động liên quan đến blog, tương tự như cách đã làm với question/answer system.

## Các thay đổi đã thực hiện

### 1. Thêm email templates mới vào `notification.service.js`

Đã thêm 3 action types mới:

- `new_blog_comment`: Gửi notification khi có comment mới trên blog
- `blog_upvote`: Gửi notification khi blog được upvote
- `blog_comment_upvote`: Gửi notification khi comment blog được upvote

### 2. Cập nhật `Blog.service.js`

- **Import NotificationService**: Thêm import cho NotificationService
- **Cập nhật `createComment()`**: Gửi notification đến tác giả blog khi có comment mới
- **Cập nhật `voteBlog()`**: Gửi notification đến tác giả blog khi được upvote
- **Cập nhật `voteComment()`**: Gửi notification đến tác giả comment khi được upvote

### 3. Cập nhật `blog.repository.js`

- **Cập nhật `voteComment()`**: Thêm populate cho blog info để có đủ thông tin cho notification

## Logic hoạt động

### 1. Khi có comment mới trên blog

- Kiểm tra tác giả comment khác tác giả blog
- Gửi email notification với:
  - Tiêu đề blog
  - Nội dung comment (cắt ngắn nếu quá dài)
  - Link đến blog

### 2. Khi blog được upvote

- Kiểm tra người vote khác tác giả blog
- Kiểm tra user thật sự upvote (không phải bỏ upvote)
- Gửi email notification với:
  - Tiêu đề blog
  - Tổng số upvotes hiện tại
  - Link đến blog

### 3. Khi comment blog được upvote

- Kiểm tra người vote khác tác giả comment
- Kiểm tra user thật sự upvote comment
- Gửi email notification với:
  - Tiêu đề blog
  - Tổng số upvotes của comment
  - Link đến comment cụ thể

## Template email

### new_blog_comment

```html
<h3>Xin chào [tên user]!</h3>
<p>Có người vừa bình luận về blog "[tên blog]" của bạn.</p>
<blockquote>[nội dung comment]</blockquote>
<p>Bạn có thể xem chi tiết tại: <a href="[link blog]">Xem blog</a></p>
```

### blog_upvote

```html
<h3>Xin chào [tên user]!</h3>
<p>Blog "[tên blog]" của bạn vừa nhận được một upvote! 👍</p>
<p>Tổng số upvotes hiện tại: [số upvotes]</p>
<p><a href="[link blog]">Xem blog</a></p>
```

### blog_comment_upvote

```html
<h3>Xin chào [tên user]!</h3>
<p>Bình luận của bạn về blog "[tên blog]" vừa nhận được một upvote! 👍</p>
<p>Tổng số upvotes hiện tại: [số upvotes]</p>
<p><a href="[link comment]">Xem bình luận</a></p>
```

## Cấu trúc payload cho notifications

### new_blog_comment

```javascript
{
  blogId: string,
  blogTitle: string,
  blogSlug: string,
  commentContent: string,
  commenterId: string,
  blogUrl: string
}
```

### blog_upvote

```javascript
{
  blogId: string,
  blogTitle: string,
  blogSlug: string,
  totalUpvotes: number,
  voterUserId: string,
  blogUrl: string
}
```

### blog_comment_upvote

```javascript
{
  commentId: string,
  blogId: string,
  blogTitle: string,
  blogSlug: string,
  totalUpvotes: number,
  voterUserId: string,
  commentUrl: string
}
```

## Kiểm tra tránh spam

- Chỉ gửi notification khi user khác tác giả (tránh self-notification)
- Chỉ gửi notification khi thật sự upvote (không phải toggle bỏ vote)
- Email được gửi bất đồng bộ để không ảnh hưởng performance

## Testing

Để test các tính năng mới:

1. Tạo blog với user A
2. Comment blog đó với user B → user A nhận email
3. Upvote blog với user B → user A nhận email
4. Upvote comment với user C → user B nhận email

## Môi trường

- Frontend URL: `process.env.FRONTEND_BASE_URL` (default: http://localhost:5173)
- Email service: Gmail SMTP
- Background processing: `setImmediate()` để không block main thread
