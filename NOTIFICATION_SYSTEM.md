# Notification System & Socket Integration

## 📋 Tổng quan

Hệ thống notification được thiết kế để:

- Gửi thông báo email bất đồng bộ khi có hoạt động liên quan đến user
- Gửi thông báo real-time qua socket nếu user đang online
- Quản lý trạng thái online/offline của user
- Xử lý background queue với worker pool

## 🏗️ Kiến trúc

### Components:

1. **Notification Model** - Lưu trữ notification và trạng thái
2. **Notification Service** - Xử lý logic notification với background queue
3. **Socket Service** - Quản lý kết nối socket và online status
4. **Worker Pool** - Xử lý gửi email bất đồng bộ

## 🔌 Socket.io Integration

### Client Connection:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  withCredentials: true,
});

// Authenticate after login
socket.emit('user_login', { token: 'your_jwt_token' });

// Listen for auth response
socket.on('auth_success', (data) => {
  console.log('Connected as user:', data.userId);
});

// Listen for notifications
socket.on('new_notification', (notification) => {
  console.log('New notification:', notification);
  // Update UI
});

// Handle user online/offline status
socket.on('user_online', ({ userId }) => {
  console.log(`User ${userId} is online`);
});

socket.on('user_offline', ({ userId }) => {
  console.log(`User ${userId} went offline`);
});

// Keep alive (send every 30 seconds)
setInterval(() => {
  socket.emit('ping');
}, 30000);

// Handle token expiration
if (tokenExpired) {
  socket.emit('token_expired');
}

// Logout
function logout() {
  socket.emit('user_logout');
}
```

## 📧 Email Templates

### Supported notification types:

- `new_answer` - Có câu trả lời mới cho câu hỏi
- `question_upvote` - Câu hỏi nhận được upvote
- `question_downvote` - Câu hỏi nhận được downvote
- `answer_upvote` - Câu trả lời nhận được upvote
- `answer_downvote` - Câu trả lời nhận được downvote

## 🔄 Background Processing

### Worker Pool Architecture:

- **Queue**: In-process array queue
- **Workers**: 3 worker threads for email processing
- **Retry**: Automatic retry up to 3 times
- **Error Handling**: Email errors logged to database

### Workflow:

1. User action triggers notification creation
2. Check if user is online → send socket notification
3. Queue email task for background processing
4. Worker thread picks up task and sends email
5. Update notification status in database

## 📚 API Endpoints

### Notification APIs:

```
GET /api/notifications                 - Get user notifications (paginated)
GET /api/notifications/unread-count    - Get unread count
PUT /api/notifications/:id/read        - Mark notification as read
PUT /api/notifications/read-all        - Mark all notifications as read
```

### Example Response:

```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "id": "...",
      "userId": "...",
      "action": "new_answer",
      "payload": {
        "questionTitle": "How to use React hooks?",
        "answerContent": "You can use useState to...",
        "questionUrl": "http://localhost:5173/question/123"
      },
      "emailSent": true,
      "sentViaSocket": true,
      "isRead": false,
      "createdAt": "2025-09-21T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

## ⚙️ Environment Variables

Add to your `.env` file:

```bash
# Existing email config
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=abcdefghijklmnop

# Frontend URL for notification links
FRONTEND_BASE_URL=http://localhost:5173

# JWT secrets (existing)
JWT_ACCESS_SECRET=your_jwt_secret
```

## 🧪 Testing

### Test Socket Connection:

1. Start server: `npm run dev`
2. Connect client with valid JWT token
3. Perform actions (answer question, vote)
4. Check console logs for socket events

### Test Email Notifications:

1. Ensure Gmail app password is configured
2. Answer someone's question or vote
3. Check email inbox for notification
4. Check database for notification status

### Test Notification APIs:

```bash
# Get notifications
GET /api/notifications?page=1&limit=10
Authorization: Bearer <token>

# Get unread count
GET /api/notifications/unread-count
Authorization: Bearer <token>

# Mark as read
PUT /api/notifications/64f8b2c3d1234567/read
Authorization: Bearer <token>
```

## 🔧 Monitoring

### Logs to monitor:

- `✅ Notification processed successfully`
- `❌ Notification processing failed`
- `🔌 New socket connection`
- `👤 User disconnected`
- `📬 Notification sent to user via socket`

### Database queries for monitoring:

```javascript
// Failed email notifications
db.notifications.find({ emailSent: false, retryCount: { $gte: 3 } });

// Online users count
socketService.getOnlineUsersCount();

// Unprocessed notifications
db.notifications.find({ emailSent: false, retryCount: { $lt: 3 } });
```

## ⚡ Performance Considerations

1. **Worker Pool**: Limits concurrent email sending
2. **Retry Logic**: Prevents infinite retries
3. **Socket Cleanup**: Removes inactive connections
4. **Database Indexes**: Optimized for queries
5. **Payload Size**: Keep notification payload small

## 🔒 Security

1. **JWT Verification**: All socket connections validated
2. **User Isolation**: Notifications only sent to intended recipients
3. **Email Sanitization**: HTML content sanitized
4. **Rate Limiting**: Consider adding rate limits for notifications

## 🐛 Troubleshooting

### Common Issues:

1. **Socket not connecting**:

   - Check CORS configuration
   - Verify JWT token validity
   - Check server logs

2. **Emails not sending**:

   - Verify EMAIL_USER/EMAIL_PASS in .env
   - Check Gmail app password
   - Monitor worker thread errors

3. **Notifications not appearing**:
   - Verify user permissions
   - Check notification creation logic
   - Monitor socket events

### Debug Commands:

```javascript
// Check online users
const socketService = require('./app/services/common/socket.service');
console.log('Online users:', socketService.getOnlineUsers());

// Check notification queue
// (Internal queue, check server logs)

// Verify email config
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});
transporter.verify().then(console.log).catch(console.error);
```
