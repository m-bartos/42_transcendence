-- Adding mfa otp field
ALTER TABLE users ADD COLUMN mfa_otp TEXT DEFAULT NULL;