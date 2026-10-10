# KRAVIX Portal Backend

## Events API curl examples

Set `TOKEN` to a valid JWT and replace UUID placeholders with real IDs.

```bash
# List events (pagination and search are optional)
curl -H "Authorization: Bearer $TOKEN" "http://localhost:5000/api/events?page=1&limit=20&search=planning"

# Upcoming events
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/events/upcoming

# Today's events
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/events/today

# Events dashboard
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/events/dashboard

# Get an event
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/events/EVENT_ID

# Create an event
curl -X POST http://localhost:5000/api/events -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"title":"Sprint planning","description":"Plan the next sprint","start_date":"2026-07-13T10:00:00+05:30","end_date":"2026-07-13T11:00:00+05:30","location":"Meeting Room A","attendees":["EMPLOYEE_UUID"]}'

# Update an event
curl -X PUT http://localhost:5000/api/events/EVENT_ID -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"location":"Conference Room","attendees":["EMPLOYEE_UUID"]}'

# Delete an event
curl -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/events/EVENT_ID

# List the current user's invitations
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/events/invitations

# Respond to an invitation (accept, decline, or maybe)
curl -X POST http://localhost:5000/api/events/invitations/INVITATION_ID/respond -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"status":"accept"}'

# Schedule or replace the current user's reminder for an event
curl -X POST http://localhost:5000/api/events/EVENT_ID/reminder -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"reminder":"2026-07-13T09:45:00+05:30"}'
```

## Tasks API curl examples

```bash
# Tasks assigned to the authenticated user
curl -H "Authorization: Bearer $TOKEN" "http://localhost:5000/api/tasks/my-tasks?status=pending"

# List tasks (managers can filter all tasks; employees see their assigned tasks)
curl -H "Authorization: Bearer $TOKEN" "http://localhost:5000/api/tasks?status=in-progress&priority=high&page=1&limit=20"

# Dashboard counts grouped by status
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/tasks/stats

# Get a task, including comments
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/tasks/TASK_ID

# Create a task (admin, HR, or CEO)
curl -X POST http://localhost:5000/api/tasks -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"title":"Prepare release notes","assigned_to":"EMPLOYEE_UUID","priority":"high","due_date":"2026-07-20"}'

# Update a task
curl -X PUT http://localhost:5000/api/tasks/TASK_ID -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"progress":50,"actual_hours":3}'

# Change task status
curl -X PATCH http://localhost:5000/api/tasks/TASK_ID/status -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"status":"completed"}'

# Delete a task
curl -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/tasks/TASK_ID

# Add a comment
curl -X POST http://localhost:5000/api/tasks/TASK_ID/comments -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"content":"Draft is ready for review."}'

# Delete a comment
curl -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/tasks/TASK_ID/comments/COMMENT_ID
```

## Settings API curl examples

```bash
# Company settings
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/settings/company
curl -X PUT http://localhost:5000/api/settings/company -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"company_name":"KRAVIX","address":"1 Main Street","email":"contact@kravix.com","timezone":"Asia/Kolkata","currency":"INR"}'

# Preferences for the authenticated user
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/settings/user-preferences
curl -X PUT http://localhost:5000/api/settings/user-preferences -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"theme":"dark","language":"en"}'

# System settings (admin only)
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/settings/system
curl -X PUT http://localhost:5000/api/settings/system -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"maintenance_mode":false}'

# Per-user notification settings
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/settings/notifications
curl -X PUT http://localhost:5000/api/settings/notifications -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"email":true,"push":false,"in_app":true}'
```
