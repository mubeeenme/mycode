-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_images ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        auth.jwt() ->> 'role' IN ('admin', 'manager')
    );

CREATE POLICY "Admins can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' IN ('admin', 'manager')
    );

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        auth.jwt() ->> 'role' IN ('admin', 'manager')
    );

-- Products policies (public catalog access)
CREATE POLICY "Public can view active products" ON public.products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all products" ON public.products
    FOR SELECT USING (
        auth.jwt() ->> 'role' IN ('admin', 'manager')
    );

CREATE POLICY "Admins can insert products" ON public.products
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' IN ('admin', 'manager')
    );

CREATE POLICY "Admins can update products" ON public.products
    FOR UPDATE USING (
        auth.jwt() ->> 'role' IN ('admin', 'manager')
    );

CREATE POLICY "Admins can delete products" ON public.products
    FOR DELETE USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Product images policies
CREATE POLICY "Public can view product images" ON public.product_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products
            WHERE id = product_id AND is_active = true
        )
    );

CREATE POLICY "Admins can manage product images" ON public.product_images
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('admin', 'manager')
    );

-- Product specs policies
CREATE POLICY "Public can view product specs" ON public.product_specs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products
            WHERE id = product_id AND is_active = true
        )
    );

CREATE POLICY "Admins can manage product specs" ON public.product_specs
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('admin', 'manager')
    );

-- Inventory policies
CREATE POLICY "Public can view inventory levels" ON public.inventory
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage inventory" ON public.inventory
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('admin', 'manager')
    );

-- Addresses policies
CREATE POLICY "Users can view own addresses" ON public.addresses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses" ON public.addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses" ON public.addresses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses" ON public.addresses
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all addresses" ON public.addresses
    FOR SELECT USING (
        auth.jwt() ->> 'role' IN ('admin', 'manager')
    );

-- Carts policies
CREATE POLICY "Users can view own carts" ON public.carts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own carts" ON public.carts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own carts" ON public.carts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own carts" ON public.carts
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Guests can view carts by session" ON public.carts
    FOR SELECT USING (session_id IS NOT NULL);

CREATE POLICY "Guests can update carts by session" ON public.carts
    FOR UPDATE USING (session_id IS NOT NULL);

CREATE POLICY "Admins can view all carts" ON public.carts
    FOR SELECT USING (
        auth.jwt() ->> 'role' IN ('admin', 'manager')
    );

-- Cart items policies
CREATE POLICY "Users can view own cart items" ON public.cart_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE id = cart_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own cart items" ON public.cart_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE id = cart_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own cart items" ON public.cart_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE id = cart_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own cart items" ON public.cart_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE id = cart_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Guests can view cart items by session" ON public.cart_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE id = cart_id AND session_id IS NOT NULL
        )
    );

CREATE POLICY "Admins can view all cart items" ON public.cart_items
    FOR SELECT USING (
        auth.jwt() ->> 'role' IN ('admin', 'manager')
    );

-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (
        auth.jwt() ->> 'role' IN ('admin', 'manager')
    );

CREATE POLICY "Admins can update orders" ON public.orders
    FOR UPDATE USING (
        auth.jwt() ->> 'role' IN ('admin', 'manager')
    );

-- Order items policies
CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = order_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all order items" ON public.order_items
    FOR SELECT USING (
        auth.jwt() ->> 'role' IN ('admin', 'manager')
    );

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = order_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all payments" ON public.payments
    FOR SELECT USING (
        auth.jwt() ->> 'role' IN ('admin', 'manager')
    );

CREATE POLICY "Admins can update payments" ON public.payments
    FOR UPDATE USING (
        auth.jwt() ->> 'role' IN ('admin', 'manager')
    );

-- Reviews policies
CREATE POLICY "Public can view approved reviews" ON public.reviews
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view own reviews" ON public.reviews
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reviews" ON public.reviews
    FOR SELECT USING (
        auth.jwt() ->> 'role' IN ('admin', 'manager')
    );

CREATE POLICY "Admins can update review status" ON public.reviews
    FOR UPDATE USING (
        auth.jwt() ->> 'role' IN ('admin', 'manager')
    );

-- Review images policies
CREATE POLICY "Public can view approved review images" ON public.review_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.reviews
            WHERE id = review_id AND status = 'approved'
        )
    );

CREATE POLICY "Users can view own review images" ON public.review_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.reviews
            WHERE id = review_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own review images" ON public.review_images
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.reviews
            WHERE id = review_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage review images" ON public.review_images
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('admin', 'manager')
    );