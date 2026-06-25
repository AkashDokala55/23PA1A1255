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

# Stage 2
## Persistent Storage Selection
### Recommended Database
I recommend **PostgreSQL** as the persistent storage because:
-- Supports ACID transactions for data consistency.
-- Suitable for structured notification data.
-- Fast querying using indexes.
-- Supports pagination efficiently.
-- Easy to scale with indexing and partitioning.
## Database Schema
### Table: Users

 Column      Type               
 
 user_id     UUID (Primary Key) 
 name        VARCHAR(100)       
 email       VARCHAR(100)       
 created_at  TIMESTAMP          

---

### Table: Notifications
 Column           Type               
  
 notification_id  UUID (Primary Key) 
 title            VARCHAR(255)       
 message          TEXT               
 priority         VARCHAR(20)        
 status           VARCHAR(20)        
 created_at       TIMESTAMP          
### Table: User_Notifications

 Column           Type               

 id               UUID (Primary Key) 
 user_id          UUID (Foreign Key) 
 notification_id  UUID (Foreign Key) 
 is_read          BOOLEAN            
 read_at          TIMESTAMP          
## Sample SQL Queries
### Insert Notification
```sql
INSERT INTO Notifications(title, message, priority, status)
VALUES
('Placement Drive',
'Amazon Online Assessment Tomorrow',
'HIGH',
'ACTIVE');
```
### Get All Notifications
```sql
SELECT * FROM Notifications;
```
### Get Notifications of a User
```sql
SELECT *
FROM User_Notifications
WHERE user_id='USER001';
```
### Mark Notification as Read
```sql
UPDATE User_Notifications
SET is_read=true,
read_at=NOW()
WHERE notification_id='NOT1001'
AND user_id='USER001';
```
### Delete Notification
```sql
DELETE FROM Notifications
WHERE notification_id='NOT1001';
```
## Problems with Increasing Data Volume
As the number of users and notifications grows:
-- Database queries become slower.
-- Pagination performance decreases.
-- Read operations increase significantly.
-- Storage requirements become larger.
## Solutions
-- Create indexes on frequently searched columns.
-- Use pagination for API responses.
-- Archive old notifications.
-- Partition notification tables.
-- Use Redis caching for frequently accessed data.

