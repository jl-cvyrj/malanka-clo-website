-- Align currency columns with the JPA mappings (String length = 3 => varchar(3)).
-- The initial schema used CHAR(3), which Hibernate maps as bpchar and rejects
-- during schema validation (ddl-auto=validate).
ALTER TABLE products
    ALTER COLUMN currency TYPE VARCHAR(3);

ALTER TABLE orders
    ALTER COLUMN currency TYPE VARCHAR(3);
