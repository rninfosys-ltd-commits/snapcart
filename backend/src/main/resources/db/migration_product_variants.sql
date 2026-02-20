-- Migration Script: Denormalized to Normalized Product Variants
-- Author: Senior Fullstack Architect
-- Purpose: Move color/size data to attributes tables without data loss.

-- 1. Create Attributes if they don't exist
INSERT IGNORE INTO product_attributes (name) VALUES ('Color'), ('Size');

-- 2. Populate Attribute Values for Colors
INSERT IGNORE INTO attribute_values (attribute_id, value, metadata)
SELECT 
    (SELECT id FROM product_attributes WHERE name = 'Color'),
    DISTINCT color,
    color_hex
FROM product_variant;

-- 3. Populate Attribute Values for Sizes
INSERT IGNORE INTO attribute_values (attribute_id, value)
SELECT 
    (SELECT id FROM product_attributes WHERE name = 'Size'),
    DISTINCT size
FROM product_variant;

-- 4. Map existing variants to new attribute values
INSERT INTO variant_attribute_values (variant_id, attribute_value_id)
SELECT 
    pv.id,
    av.id
FROM product_variant pv
JOIN attribute_values av ON (
    (av.attribute_id = (SELECT id FROM product_attributes WHERE name = 'Color') AND av.value = pv.color)
    OR
    (av.attribute_id = (SELECT id FROM product_attributes WHERE name = 'Size') AND av.value = pv.size)
);

-- 5. AFTER VERIFICATION, columns can be dropped (NOT in this script for safety)
-- ALTER TABLE product_variant DROP COLUMN color;
-- ALTER TABLE product_variant DROP COLUMN color_hex;
-- ALTER TABLE product_variant DROP COLUMN size;
