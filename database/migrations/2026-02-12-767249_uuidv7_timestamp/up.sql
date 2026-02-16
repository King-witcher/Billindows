-- Migration generated on 2026-02-12 21:18:44

CREATE FUNCTION uuidv7_timestamp(uuid UUID)
  RETURNS TIMESTAMP WITHOUT TIME ZONE
  LANGUAGE sql
  IMMUTABLE
AS $function$
  SELECT to_timestamp(('x'||replace(uuid::text, '-', ''))::bit(48)::bigint / 1000) AS result;
$function$;
