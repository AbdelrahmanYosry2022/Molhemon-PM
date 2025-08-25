-- Add new columns to the payments table
ALTER TABLE payments
ADD COLUMN type TEXT,
ADD COLUMN payment_method TEXT,
ADD COLUMN status TEXT,
ADD COLUMN milestone_id UUID REFERENCES milestones(id),
ADD COLUMN attachment_url TEXT;

-- Add comments to the new columns for clarity
COMMENT ON COLUMN payments.type IS 'The type of transaction, e.g., ''income'' or ''expense''.';
COMMENT ON COLUMN payments.payment_method IS 'The method of payment, e.g., ''bank_transfer'', ''credit_card'', ''cash'', ''paypal''.';
COMMENT ON COLUMN payments.status IS 'The status of the payment, e.g., ''pending'', ''paid'', ''overdue''.';
COMMENT ON COLUMN payments.milestone_id IS 'The milestone associated with this payment.';
COMMENT ON COLUMN payments.attachment_url IS 'URL of the payment attachment (e.g., invoice).';
