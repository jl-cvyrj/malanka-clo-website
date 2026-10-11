-- Seed the initial product catalog.
--
-- Prices are uniform (90.00 BYN) and every product gets the full fixed size
-- range (XS–XXL, all available); no images are seeded. Products are keyed by
-- their unique slug, so this migration is safe on databases where the catalog
-- already exists: the pre-existing "tshirt-belarus" row is normalised in place
-- instead of being duplicated, and sizes that are already present are skipped.

INSERT INTO products (category_id, name, slug, description, price, currency, active)
VALUES
    ((SELECT id FROM categories WHERE slug = 't-shirts'),    'Футболка «Belarus»',            'tshirt-belarus',           NULL, 90.00, 'BYN', TRUE),
    ((SELECT id FROM categories WHERE slug = 't-shirts'),    'Футболка «Old Belarus»',        'tshirt-old-belarus',       NULL, 90.00, 'BYN', TRUE),
    ((SELECT id FROM categories WHERE slug = 't-shirts'),    'Футболка черная «Old Belarus»', 'tshirt-old-belarus-black', NULL, 90.00, 'BYN', TRUE),
    ((SELECT id FROM categories WHERE slug = 't-shirts'),    'Футболка «Kvetki»',             'tshirt-kvetki',            NULL, 90.00, 'BYN', TRUE),
    ((SELECT id FROM categories WHERE slug = 'longsleeves'), 'Лонгсліў «Belarus»',            'longsleeve-belarus',       NULL, 90.00, 'BYN', TRUE),
    ((SELECT id FROM categories WHERE slug = 't-shirts'),    'Футболка «KronaSaint»',         'tshirt-kronasaint',        NULL, 90.00, 'BYN', TRUE),
    ((SELECT id FROM categories WHERE slug = 't-shirts'),    'Футболка «Мірскі замак»',       'tshirt-mirski-zamak',      NULL, 90.00, 'BYN', TRUE),
    ((SELECT id FROM categories WHERE slug = 't-shirts'),    'Футболка «Лідскі замак»',       'tshirt-lidski-zamak',      NULL, 90.00, 'BYN', TRUE),
    ((SELECT id FROM categories WHERE slug = 't-shirts'),    'Футболка «Belarus 2.0»',        'tshirt-belarus-2',         NULL, 90.00, 'BYN', TRUE),
    ((SELECT id FROM categories WHERE slug = 'longsleeves'), 'Лонгсліў «Belarus 2.0»',        'longsleeve-belarus-2',     NULL, 90.00, 'BYN', TRUE),
    ((SELECT id FROM categories WHERE slug = 't-shirts'),    'Футболка «RedZubr»',            'tshirt-redzubr',           NULL, 90.00, 'BYN', TRUE)
ON CONFLICT (slug) DO UPDATE
SET name        = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    price       = EXCLUDED.price,
    currency    = EXCLUDED.currency,
    active      = EXCLUDED.active,
    updated_at  = CURRENT_TIMESTAMP;

-- Give every seeded product the full fixed size range. Existing sizes are kept.
INSERT INTO product_sizes (product_id, size_code, available)
SELECT p.id, s.size_code, TRUE
FROM products p
CROSS JOIN (VALUES ('XS'), ('S'), ('M'), ('L'), ('XL'), ('XXL')) AS s(size_code)
WHERE p.slug IN (
    'tshirt-belarus',
    'tshirt-old-belarus',
    'tshirt-old-belarus-black',
    'tshirt-kvetki',
    'longsleeve-belarus',
    'tshirt-kronasaint',
    'tshirt-mirski-zamak',
    'tshirt-lidski-zamak',
    'tshirt-belarus-2',
    'longsleeve-belarus-2',
    'tshirt-redzubr'
)
ON CONFLICT (product_id, size_code) DO NOTHING;
