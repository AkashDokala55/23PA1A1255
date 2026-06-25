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

# Stage 3
## Existing Query
```sql
SELECT * FROM notifications WHERE studentID = 1042
AND isRead = false ORDER BY createdAt DESC;
```
## 1. Is this query accurate?
Yes.
The query correctly retrieves all unread notifications for the student with ID **1042** and sorts them by the latest notification first using `createdAt DESC`.
---
## 2. Why is this query slow?
As the system grows to around **50,000 students** and **5,000,000 notifications**, this query becomes slow because:
-- It may perform a full table scan if indexes are missing.
-- Sorting millions of records using `ORDER BY createdAt DESC` is expensive.
-- Filtering by `studentID` and `isRead` without indexes increases execution time.
-- Fetching all columns using `SELECT *` transfers unnecessary data.
## 3. What would you change?
Instead of selecting every column, retrieve only the required fields.
```sql
SELECT notificationID,
       title,
       message,
       notificationType,
       createdAt FROM notifications WHERE studentID = 1042
AND isRead = false ORDER BY createdAt DESC;
```
Also create a composite index:
```sql
CREATE INDEX idx_student_read_created
ON notifications(studentID, isRead, createdAt);
```
Use pagination for better performance.
Example:
```sql
SELECT notificationID,
       title,
       message,
       notificationType,
       createdAt FROM notifications WHERE studentID = 1042
AND isRead = false ORDER BY createdAt DESC LIMIT 20 OFFSET 0;
```
## 4. Likely Computational Cost
### Without Index
-- Search : **O(n)**
-- Sorting : **O(n log n)**
Overall performance becomes slow for millions of records.
### With Proper Composite Index
-- Search : **O(log n)**
-- Sorting becomes much faster because indexed records are already ordered.

## 5. Should we create indexes on every column?
**No.**
Creating indexes on every column is not recommended because:
-- Extra disk space is required.
-- INSERT operations become slower.
-- UPDATE operations become slower.
-- DELETE operations become slower.
-- Database maintenance becomes expensive.
-- Many indexes may never be used.
Indexes should only be created on columns that are frequently used in:
-- WHERE clauses
-- JOIN conditions
-- ORDER BY clauses
-- GROUP BY clauses
## 6. SQL Query
Find all students who received a **Placement** notification during the last **7 days**.
```sql
SELECT DISTINCT studentID FROM notifications
WHERE notificationType = 'Placement' AND createdAt >= NOW() - INTERVAL '7 days';
```
## Recommended Index
```sql
CREATE INDEX idx_notification_type_created
ON notifications(notificationType, createdAt);
```

# Stage 4
## Problem Statement
Currently, notifications are fetched from the database every time a student opens a page. As the number of users increases, the database receives a large number of repeated read requests, causing high latency and poor user experience.

## Proposed Solution
To improve performance, I would use the following strategies:
### 1. Redis Caching
Store recently accessed notifications and unread notification counts in Redis.
Benefits:
-- Reduces database load.
-- Faster response time.
-- Improves user experience.
Tradeoff:
-- Extra memory cost.
-- Cache invalidation must be handled correctly.
### 2. Pagination
Instead of returning all notifications, fetch only a limited number.
Example:
```sql
SELECT *
FROM notifications
WHERE studentID = 1042
ORDER BY createdAt DESC
LIMIT 20 OFFSET 0;
```
Benefits:
-- Smaller response size.
-- Faster database queries.
Tradeoff:
 Multiple requests are required for large datasets.
### 3. Lazy Loading
Initially load only the latest notifications.
Older notifications are fetched only when the user scrolls.
Benefits:
-- Faster page loading.
-- Less network traffic.
Tradeoff:
-- Requires additional API calls.
### 4. Database Indexing
Create indexes on frequently queried columns.
```sql
CREATE INDEX idx_student_created
ON notifications(studentID, createdAt);
```
Benefits:
-- Faster search.
-- Faster sorting.
Tradeoff:
-- Slower INSERT and UPDATE operations.

