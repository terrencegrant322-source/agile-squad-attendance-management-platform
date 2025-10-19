-- Squads
CREATE TABLE squads (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  workdays TEXT NOT NULL DEFAULT 'Mon,Tue,Wed,Thu,Fri',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Squad members with roles
CREATE TABLE squad_members (
  id BIGSERIAL PRIMARY KEY,
  squad_id BIGINT NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Squad Lead', 'Member', 'Viewer')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(squad_id, user_id)
);

CREATE INDEX idx_squad_members_squad ON squad_members(squad_id);
CREATE INDEX idx_squad_members_user ON squad_members(user_id);

-- Sprints
CREATE TABLE sprints (
  id BIGSERIAL PRIMARY KEY,
  squad_id BIGINT NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sprints_squad ON sprints(squad_id);
CREATE INDEX idx_sprints_active ON sprints(is_active) WHERE is_active = true;

-- Attendance records
CREATE TABLE attendance_records (
  id BIGSERIAL PRIMARY KEY,
  squad_id BIGINT NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  sprint_id BIGINT REFERENCES sprints(id) ON DELETE SET NULL,
  check_in_time TIMESTAMPTZ NOT NULL,
  check_out_time TIMESTAMPTZ,
  work_mode TEXT NOT NULL CHECK (work_mode IN ('Office', 'Remote', 'Client Site', 'OOO')),
  location_data JSONB,
  ip_address TEXT,
  notes TEXT,
  is_partial_day BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attendance_squad ON attendance_records(squad_id);
CREATE INDEX idx_attendance_user ON attendance_records(user_id);
CREATE INDEX idx_attendance_date ON attendance_records(check_in_time);
CREATE INDEX idx_attendance_sprint ON attendance_records(sprint_id);

-- Leave requests
CREATE TABLE leave_requests (
  id BIGSERIAL PRIMARY KEY,
  squad_id BIGINT NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('Vacation', 'Sick', 'Public Holiday', 'Training')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  supporting_docs JSONB,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leave_requests_squad ON leave_requests(squad_id);
CREATE INDEX idx_leave_requests_user ON leave_requests(user_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);

-- Work mode status (current status of each user)
CREATE TABLE work_mode_status (
  user_id TEXT PRIMARY KEY,
  squad_id BIGINT NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  current_mode TEXT NOT NULL CHECK (current_mode IN ('Office', 'Remote', 'Client Site', 'OOO')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_work_mode_squad ON work_mode_status(squad_id);

-- Attendance rules
CREATE TABLE attendance_rules (
  id BIGSERIAL PRIMARY KEY,
  squad_id BIGINT NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  minimum_hours DOUBLE PRECISION NOT NULL DEFAULT 8.0,
  late_threshold_minutes INTEGER NOT NULL DEFAULT 15,
  early_checkout_threshold_minutes INTEGER NOT NULL DEFAULT 30,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(squad_id)
);

-- Notifications
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read) WHERE read = false;

-- Audit log
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id BIGINT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);
