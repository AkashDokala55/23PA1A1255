# Stage 1

## Notification System REST API Design

### Overview
This document defines the REST APIs required for the Campus Notification System. The APIs allow users to receive notifications after login, view notifications, mark them as read, delete notifications, and retrieve unread notification counts.
All APIs use JSON and Bearer Token authentication.
## 1. Get Notifications

### Endpoint
GET /api/v1/notifications
### Description
Returns all notifications of the logged-in user.
### Headers
Authorization: Bearer <token>
Content-Type: application/json
### Query Parameters
page=1
limit=20
status=all | read | unread
### Success Response (200)
```json
{
  "success": true,
  "page": 1,
  "limit": 20,
  "total": 45,
  "notifications": [
    {
      "id": "N001",
      "title": "Exam Schedule",
      "message": "Mid exams begin Monday",
      "type": "academic",
      "priority": "high",
      "isRead": false,
      "createdAt": "2026-06-25T10:30:00Z"
    }
  ]
}
### GET /notifications
Description:
Returns all notifications.
Response
```json
[
   {
      "notificationId":"NOT1001",
      "title":"Placement Drive",
      "priority":"HIGH",
      "status":"ACTIVE"
   }
]
```
Status Codes
200 OK
401 Unauthorized
### GET /notifications/{id}
Description
Returns a specific notification.
Response
```json
{
   "notificationId":"NOT1001",
   "title":"Placement Drive",
   "message":"Amazon OA Tomorrow"
}
```
### PUT /notifications/{id}
Description
Updates an existing notification.
Request
```json
{
   "title":"Updated Title",
   "message":"Updated Message",
   "priority":"MEDIUM"
}
```
Response
```json
{
   "status":"UPDATED"
}
```
### DELETE /notifications/{id}
Description
Deletes a notification.
Response
```json
{
   "status":"DELETED"
}
```
### GET /notifications/student/{studentId}
Description
Returns all notifications for a particular student.
Response
```json
[
   {
      "title":"Amazon OA",
      "priority":"HIGH"
   }
]
```