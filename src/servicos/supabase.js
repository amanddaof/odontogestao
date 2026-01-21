import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://bmcwgenirexphbdmubnc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtY3dnZW5pcmV4cGhiZG11Ym5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MjgxNjcsImV4cCI6MjA4MzMwNDE2N30.a9Vu3afZvc3aaN2Q2UWRXF4BZdhKJLVHkDCAzy-EOow"
);
