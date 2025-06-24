-- Adding mfa field
ALTER TABLE users ADD COLUMN mfa BOOLEAN DEFAULT 0;
