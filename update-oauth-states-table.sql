-- Update the oauth_states table to make code_verifier nullable
ALTER TABLE oauth_states ALTER COLUMN code_verifier DROP NOT NULL;
