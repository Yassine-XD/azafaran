ALTER TABLE notification_preferences
  ADD COLUMN email_notifications BOOLEAN NOT NULL DEFAULT TRUE;
