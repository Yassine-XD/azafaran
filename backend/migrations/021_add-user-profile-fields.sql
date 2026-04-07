CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

ALTER TABLE users ADD COLUMN gender gender_type;
ALTER TABLE users ADD COLUMN date_of_birth DATE;
