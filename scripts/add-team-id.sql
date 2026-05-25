-- Add team_id column to all tables for team data isolation
-- Run this in the Supabase SQL Editor (dashboard.supabase.com → SQL Editor)
-- Existing rows get 'team-alpha' as default.

ALTER TABLE candidates   ADD COLUMN IF NOT EXISTS team_id TEXT DEFAULT 'team-alpha';
ALTER TABLE companies    ADD COLUMN IF NOT EXISTS team_id TEXT DEFAULT 'team-alpha';
ALTER TABLE jobs         ADD COLUMN IF NOT EXISTS team_id TEXT DEFAULT 'team-alpha';
ALTER TABLE contacts     ADD COLUMN IF NOT EXISTS team_id TEXT DEFAULT 'team-alpha';
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS team_id TEXT DEFAULT 'team-alpha';
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS team_id TEXT DEFAULT 'team-alpha';
