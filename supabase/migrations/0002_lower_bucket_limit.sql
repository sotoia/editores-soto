-- 0002_lower_bucket_limit.sql
-- Lower the bucket file size limit from 200 MB to 50 MB to match Supabase free tier
-- and the new client-side cap. Run this in the SQL editor.

update storage.buckets
  set file_size_limit = 52428800  -- 50 MB
  where id = 'test-videos';
