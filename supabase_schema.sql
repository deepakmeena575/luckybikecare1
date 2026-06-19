-- Run this SQL in your Supabase SQL Editor to create the necessary table

CREATE TABLE service_records (
  "id" TEXT PRIMARY KEY,
  "timestamp" TIMESTAMPTZ NOT NULL,
  "vehicleNumber" TEXT NOT NULL,
  "vehicleModel" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "mobileNumber" TEXT NOT NULL,
  "kilometerReading" INTEGER NOT NULL DEFAULT 0,
  "dateOfService" DATE NOT NULL,
  "serviceDescription" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "labourCost" NUMERIC NOT NULL DEFAULT 0,
  "totalCost" NUMERIC NOT NULL DEFAULT 0,
  "cashPaid" NUMERIC NOT NULL DEFAULT 0,
  "onlinePaid" NUMERIC NOT NULL DEFAULT 0,
  "dueAmount" NUMERIC NOT NULL DEFAULT 0,
  "nextServiceDate" DATE NOT NULL,
  "serviceCounter" INTEGER NOT NULL DEFAULT 1
);

-- Recommended: Set up Row Level Security (RLS) if you need client-side restrictions.
-- For a basic local admin tool, you can simply allow all (not recommended for public apps):
ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all actions" ON service_records FOR ALL USING (true) WITH CHECK (true);
