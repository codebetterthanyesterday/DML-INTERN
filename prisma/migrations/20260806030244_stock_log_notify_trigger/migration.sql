-- Emits a Postgres NOTIFY on every stock_logs insert so the admin dashboard
-- can receive stock movement events in real time via LISTEN/NOTIFY (SSE),
-- without any polling.
--
-- Payload is intentionally small (ids + key fields only) — full row detail
-- is fetched by the app via a normal Prisma query once notified.

CREATE OR REPLACE FUNCTION notify_stock_log_change() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify(
    'stock_log_changes',
    json_build_object(
      'id', NEW.id,
      'productId', NEW."productId",
      'adminId', NEW."adminId",
      'type', NEW.type,
      'reason', NEW.reason,
      'quantityChange', NEW."quantityChange",
      'stockBefore', NEW."stockBefore",
      'stockAfter', NEW."stockAfter",
      'createdAt', NEW."createdAt"
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stock_log_notify_trigger ON stock_logs;

CREATE TRIGGER stock_log_notify_trigger
AFTER INSERT ON stock_logs
FOR EACH ROW
EXECUTE FUNCTION notify_stock_log_change();