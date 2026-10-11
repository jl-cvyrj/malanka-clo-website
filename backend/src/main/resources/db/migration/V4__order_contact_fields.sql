-- Additional contact / delivery fields captured on an order.
ALTER TABLE orders ADD COLUMN telegram_username VARCHAR(64);
ALTER TABLE orders ADD COLUMN postal_index VARCHAR(20);
