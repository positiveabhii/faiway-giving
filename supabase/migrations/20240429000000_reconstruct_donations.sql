-- 1. DROP EXISTING TABLE TO START FRESH (CAUTION: CLEARS DATA)
DROP TABLE IF EXISTS public.charity_donations CASCADE;

-- 2. CREATE RECONSTRUCTED TABLE
CREATE TABLE public.charity_donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id UUID REFERENCES public.draw_results(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    charity_id UUID NOT NULL REFERENCES public.charities(id),
    amount NUMERIC NOT NULL DEFAULT 0,
    donation_type TEXT NOT NULL CHECK (donation_type IN ('automatic_winnings', 'manual_direct')),
    source_winner_id UUID REFERENCES public.draw_winners(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. ADD INDEXES FOR PERFORMANCE
CREATE INDEX idx_charity_donations_draw_id ON public.charity_donations(draw_id);
CREATE INDEX idx_charity_donations_user_id ON public.charity_donations(user_id);
CREATE INDEX idx_charity_donations_charity_id ON public.charity_donations(charity_id);
CREATE INDEX idx_charity_donations_source_winner_id ON public.charity_donations(source_winner_id);

-- 4. ENABLE RLS
ALTER TABLE public.charity_donations ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES
-- Admin can do everything
CREATE POLICY "Admin full access on charity_donations"
ON public.charity_donations
FOR ALL
TO authenticated
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- Users can read their own donations
CREATE POLICY "Users can view own donations"
ON public.charity_donations
FOR SELECT
TO authenticated
USING ( user_id = auth.uid() );

-- Users can insert their own manual donations
CREATE POLICY "Users can insert own manual donations"
ON public.charity_donations
FOR INSERT
TO authenticated
WITH CHECK ( 
    user_id = auth.uid() AND 
    donation_type = 'manual_direct' 
);

-- 6. TRIGGER FOR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_charity_donations_updated_at
BEFORE UPDATE ON public.charity_donations
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
