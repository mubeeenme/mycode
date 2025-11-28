-- Seed data for testing and development

-- Insert sample products
INSERT INTO public.products (name, description, sku, price, compare_price, cost_price, weight, tags, is_active) VALUES
('Wireless Headphones', 'Premium noise-cancelling wireless headphones with 30-hour battery life', 'WH-001', 199.99, 249.99, 120.00, 0.3, ARRAY['electronics', 'audio', 'wireless'], true),
('Smart Watch', 'Fitness tracking smartwatch with heart rate monitor and GPS', 'SW-002', 299.99, 399.99, 180.00, 0.1, ARRAY['electronics', 'fitness', 'wearable'], true),
('Laptop Stand', 'Adjustable aluminum laptop stand for improved ergonomics', 'LS-003', 49.99, 69.99, 25.00, 0.8, ARRAY['accessories', 'office', 'ergonomic'], true),
('USB-C Hub', '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader', 'UH-004', 39.99, 59.99, 15.00, 0.1, ARRAY['accessories', 'electronics', 'connectivity'], true),
('Mechanical Keyboard', 'RGB mechanical keyboard with blue switches', 'MK-005', 129.99, 169.99, 75.00, 1.2, ARRAY['electronics', 'gaming', 'peripherals'], true);

-- Insert product images
INSERT INTO public.product_images (product_id, url, alt_text, sort_order, is_primary) VALUES
((SELECT id FROM public.products WHERE sku = 'WH-001'), 'https://picsum.photos/seed/headphones1/800/600.jpg', 'Wireless headphones front view', 0, true),
((SELECT id FROM public.products WHERE sku = 'WH-001'), 'https://picsum.photos/seed/headphones2/800/600.jpg', 'Wireless headphones side view', 1, false),
((SELECT id FROM public.products WHERE sku = 'SW-002'), 'https://picsum.photos/seed/watch1/800/600.jpg', 'Smart watch front view', 0, true),
((SELECT id FROM public.products WHERE sku = 'SW-002'), 'https://picsum.photos/seed/watch2/800/600.jpg', 'Smart watch side view', 1, false),
((SELECT id FROM public.products WHERE sku = 'LS-003'), 'https://picsum.photos/seed/stand1/800/600.jpg', 'Laptop stand in use', 0, true),
((SELECT id FROM public.products WHERE sku = 'UH-004'), 'https://picsum.photos/seed/hub1/800/600.jpg', 'USB-C hub with connected devices', 0, true),
((SELECT id FROM public.products WHERE sku = 'MK-005'), 'https://picsum.photos/seed/keyboard1/800/600.jpg', 'Mechanical keyboard with RGB lighting', 0, true);

-- Insert product specifications
INSERT INTO public.product_specs (product_id, name, value, sort_order) VALUES
((SELECT id FROM public.products WHERE sku = 'WH-001'), 'Brand', 'AudioTech', 0),
((SELECT id FROM public.products WHERE sku = 'WH-001'), 'Battery Life', '30 hours', 1),
((SELECT id FROM public.products WHERE sku = 'WH-001'), 'Connectivity', 'Bluetooth 5.0', 2),
((SELECT id FROM public.products WHERE sku = 'WH-001'), 'Weight', '300g', 3),
((SELECT id FROM public.products WHERE sku = 'SW-002'), 'Brand', 'SmartTech', 0),
((SELECT id FROM public.products WHERE sku = 'SW-002'), 'Display', '1.4" AMOLED', 1),
((SELECT id FROM public.products WHERE sku = 'SW-002'), 'Battery Life', '7 days', 2),
((SELECT id FROM public.products WHERE sku = 'SW-002'), 'Water Resistance', '5ATM', 3),
((SELECT id FROM public.products WHERE sku = 'LS-003'), 'Material', 'Aluminum', 0),
((SELECT id FROM public.products WHERE sku = 'LS-003'), 'Adjustable Height', 'Yes', 1),
((SELECT id FROM public.products WHERE sku = 'LS-003'), 'Compatibility', '10-17 inch laptops', 2),
((SELECT id FROM public.products WHERE sku = 'UH-004'), 'Ports', '7 ports total', 0),
((SELECT id FROM public.products WHERE sku = 'UH-004'), 'HDMI', '4K @ 30Hz', 1),
((SELECT id FROM public.products WHERE sku = 'UH-004'), 'USB Ports', '3 x USB 3.0', 2),
((SELECT id FROM public.products WHERE sku = 'MK-005'), 'Switch Type', 'Blue Mechanical', 0),
((SELECT id FROM public.products WHERE sku = 'MK-005'), 'Layout', 'TKL (87 keys)', 1),
((SELECT id FROM public.products WHERE sku = 'MK-005'), 'Backlighting', 'RGB per-key', 2);

-- Insert inventory records
INSERT INTO public.inventory (product_id, quantity_available, quantity_reserved, reorder_level) VALUES
((SELECT id FROM public.products WHERE sku = 'WH-001'), 50, 0, 10),
((SELECT id FROM public.products WHERE sku = 'SW-002'), 30, 0, 8),
((SELECT id FROM public.products WHERE sku = 'LS-003'), 100, 0, 20),
((SELECT id FROM public.products WHERE sku = 'UH-004'), 75, 0, 15),
((SELECT id FROM public.products WHERE sku = 'MK-005'), 25, 0, 5);

-- Insert sample admin user (you'll need to create this user in auth.users first)
-- This assumes you have a user with ID '00000000-0000-0000-0000-000000000000'
-- Replace with actual user ID after creating through Supabase Auth
INSERT INTO public.profiles (id, email, full_name, role) VALUES
('00000000-0000-0000-0000-000000000000', 'admin@example.com', 'Admin User', 'admin')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;