# Internal Mail (Gmail-style) – Database Schema

## Collections (MongoDB)

### internalmessage
| Field | Type | Description |
|-------|------|-------------|
| senderId | Mixed | User ID (ObjectId or 'admin') |
| senderRole | String | patient, doctor, hospital, pharmacy, lab, admin |
| senderName | String | Display name |
| senderEmail | String | Email |
| subject | String | Subject line |
| body | String | HTML or plain text body |
| threadId | ObjectId | Same as _id for first message; references root for replies |
| isDraft | Boolean | true = draft, false = sent |
| attachments | Array | [{ url, filename, size }] |
| createdAt | Date | |
| updatedAt | Date | |

### internalmessagerecipient
| Field | Type | Description |
|-------|------|-------------|
| messageId | ObjectId | ref: internalmessage |
| recipientId | Mixed | User ID |
| recipientRole | String | patient, doctor, hospital, pharmacy, lab, admin |
| recipientName | String | |
| recipientEmail | String | |
| folder | String | inbox, sent, trash, starred, important |
| readAt | Date | null = unread |
| starred | Boolean | |
| isImportant | Boolean | |
| deletedAt | Date | null = not deleted |
| createdAt | Date | |

- **Inbox**: recipientId = me, folder = 'inbox'
- **Sent**: recipientId = me (sender), folder = 'sent'
- **Drafts**: Message.isDraft = true, senderId = me (no recipient rows until send)
- **Trash**: folder = 'trash'
- **Starred**: starred = true
- **Important**: isImportant = true

## API (all under /api/mail, authAny)

- `POST /api/mail/recipients/resolve` – resolve recipients by role/department/location/userId
- `GET /api/mail/counts` – folder counts + unread
- `GET /api/mail/folders/:folder` – list messages (inbox, sent, drafts, trash, starred, important)
- `GET /api/mail/message/:messageId` – single message + mark read
- `GET /api/mail/thread/:messageId` – full thread
- `POST /api/mail/send` – send (multipart: subject, body, recipientFilter JSON, attachments)
- `POST /api/mail/draft` – save draft
- `POST /api/mail/reply` – reply to message (creates new message in thread)
- `PATCH /api/mail/message/:messageId` – update folder, starred, isImportant, read
- `POST /api/mail/bulk` – bulk read, unread, trash, inbox, starred, unstarred
- `GET /api/mail/search` – search by q, subject, sender, dateFrom, dateTo
- `DELETE /api/mail/draft/:draftId` – delete draft
