-- Add account_id to transactions table to link transactions to treasury accounts
ALTER TABLE public.transactions 
ADD COLUMN account_id uuid REFERENCES public.treasury_accounts(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_transactions_account_id ON public.transactions(account_id);