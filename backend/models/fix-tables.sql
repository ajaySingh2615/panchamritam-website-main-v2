//
Table
name
fix

-- Rename tables to match the case expected by the code
RENAME TABLE `hsn_codes` TO `HSN_Codes`;
RENAME TABLE `gst_rates` TO `GST_Rates`;

-- Check that the tables exist with the right names
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'panchamritam' 
AND table_name IN ('HSN_Codes', 'GST_Rates');
