-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_inventory_updated_at
    BEFORE UPDATE ON public.inventory
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_addresses_updated_at
    BEFORE UPDATE ON public.addresses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_carts_updated_at
    BEFORE UPDATE ON public.carts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_number TEXT;
    timestamp_part TEXT;
    random_part TEXT;
BEGIN
    timestamp_part := TO_CHAR(NOW(), 'YYYYMMDDHH24MISS');
    random_part := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    order_number := 'ORD' || timestamp_part || random_part;
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.orders WHERE order_number = order_number) LOOP
        random_part := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        order_number := 'ORD' || timestamp_part || random_part;
    END LOOP;
    
    RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- Function to reserve inventory
CREATE OR REPLACE FUNCTION public.reserve_inventory(
    p_product_id UUID,
    p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    current_available INTEGER;
BEGIN
    -- Get current available quantity
    SELECT quantity_available INTO current_available
    FROM public.inventory
    WHERE product_id = p_product_id
    FOR UPDATE;
    
    -- Check if enough inventory is available
    IF current_available < p_quantity THEN
        RETURN FALSE;
    END IF;
    
    -- Reserve the inventory
    UPDATE public.inventory
    SET 
        quantity_available = quantity_available - p_quantity,
        quantity_reserved = quantity_reserved + p_quantity
    WHERE product_id = p_product_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to release reserved inventory
CREATE OR REPLACE FUNCTION public.release_inventory(
    p_product_id UUID,
    p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.inventory
    SET 
        quantity_available = quantity_available + p_quantity,
        quantity_reserved = quantity_reserved - p_quantity
    WHERE product_id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Function to confirm inventory (move from reserved to sold)
CREATE OR REPLACE FUNCTION public.confirm_inventory(
    p_product_id UUID,
    p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.inventory
    SET quantity_reserved = quantity_reserved - p_quantity
    WHERE product_id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to validate cart items before checkout
CREATE OR REPLACE FUNCTION public.validate_cart_items(p_cart_id UUID)
RETURNS TABLE(
    product_id UUID,
    product_name TEXT,
    available_quantity INTEGER,
    requested_quantity INTEGER,
    is_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        COALESCE(i.quantity_available, 0),
        ci.quantity,
        (COALESCE(i.quantity_available, 0) >= ci.quantity) AS is_available
    FROM public.cart_items ci
    JOIN public.products p ON ci.product_id = p.id
    LEFT JOIN public.inventory i ON p.id = i.product_id
    WHERE ci.cart_id = p_cart_id
    AND p.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate order totals
CREATE OR REPLACE FUNCTION public.calculate_order_totals(
    p_items JSONB,
    p_shipping_amount DECIMAL DEFAULT 0,
    p_tax_rate DECIMAL DEFAULT 0.08
)
RETURNS JSONB AS $$
DECLARE
    subtotal DECIMAL;
    tax_amount DECIMAL;
    total_amount DECIMAL;
    result JSONB;
BEGIN
    -- Calculate subtotal from items
    SELECT COALESCE(SUM((item->>'quantity')::DECIMAL * (item->>'unit_price')::DECIMAL), 0)
    INTO subtotal
    FROM jsonb_array_elements(p_items) AS item;
    
    -- Calculate tax
    tax_amount := subtotal * p_tax_rate;
    
    -- Calculate total
    total_amount := subtotal + tax_amount + p_shipping_amount;
    
    -- Build result
    result := jsonb_build_object(
        'subtotal', subtotal,
        'tax_amount', tax_amount,
        'shipping_amount', p_shipping_amount,
        'total_amount', total_amount
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to set verified purchase flag on reviews
CREATE OR REPLACE FUNCTION public.update_review_verified_purchase()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.reviews
    SET verified_purchase = true
    WHERE id = NEW.id
    AND EXISTS (
        SELECT 1 FROM public.order_items oi
        JOIN public.orders o ON oi.order_id = o.id
        WHERE oi.product_id = NEW.product_id
        AND o.user_id = NEW.user_id
        AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set verified purchase on review creation
CREATE TRIGGER set_review_verified_purchase
    AFTER INSERT ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_review_verified_purchase();