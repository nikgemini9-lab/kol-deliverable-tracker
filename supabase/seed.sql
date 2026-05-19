-- Seed data for demo purposes
-- Run this AFTER creating your first account through the UI
-- Replace 'YOUR_USER_ID' with your actual user UUID from auth.users

-- Step 1: Get your user ID with: SELECT id FROM auth.users LIMIT 1;
-- Step 2: Replace the UUID below and run this script

DO $$
DECLARE
  v_user_id uuid;
  v_workspace_id uuid;
  v_company_id uuid;
  v_kol1_id uuid;
  v_kol2_id uuid;
  v_kol3_id uuid;
  v_campaign1_id uuid;
  v_campaign2_id uuid;
  v_campaign3_id uuid;
  v_month integer;
  v_year integer;
BEGIN
  -- Get the first user
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found. Create an account first.';
  END IF;

  v_month := EXTRACT(MONTH FROM NOW())::integer;
  v_year := EXTRACT(YEAR FROM NOW())::integer;

  -- Create workspace
  INSERT INTO public.workspaces (name, slug, owner_id)
  VALUES ('Demo Workspace', 'demo-workspace-' || LEFT(gen_random_uuid()::text, 6), v_user_id)
  RETURNING id INTO v_workspace_id;

  -- Add user as owner
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace_id, v_user_id, 'owner')
  ON CONFLICT DO NOTHING;

  -- Create company
  INSERT INTO public.companies (workspace_id, name, x_handle, keywords, website)
  VALUES (
    v_workspace_id,
    'Acme Protocol',
    'acmeprotocol',
    ARRAY['acme', 'acme protocol', '$ACME', 'acmeprotocol'],
    'https://acme.example.com'
  )
  RETURNING id INTO v_company_id;

  -- Create KOLs
  INSERT INTO public.kols (workspace_id, name, x_handle, profile_link, monthly_fee, campaign_start, campaign_end, status, follower_count)
  VALUES (
    v_workspace_id, 'Alex Crypto', 'alexcrypto',
    'https://x.com/alexcrypto', 2500,
    (NOW() - INTERVAL '30 days')::date,
    (NOW() + INTERVAL '60 days')::date,
    'active', 125000
  )
  RETURNING id INTO v_kol1_id;

  INSERT INTO public.kols (workspace_id, name, x_handle, profile_link, monthly_fee, campaign_start, campaign_end, status, follower_count)
  VALUES (
    v_workspace_id, 'Maria Web3', 'mariaweb3',
    'https://x.com/mariaweb3', 1800,
    (NOW() - INTERVAL '15 days')::date,
    (NOW() + INTERVAL '75 days')::date,
    'active', 89000
  )
  RETURNING id INTO v_kol2_id;

  INSERT INTO public.kols (workspace_id, name, x_handle, profile_link, monthly_fee, campaign_start, campaign_end, status, follower_count)
  VALUES (
    v_workspace_id, 'DeFi Dave', 'defidave',
    'https://x.com/defidave', 3200,
    (NOW() - INTERVAL '60 days')::date,
    (NOW() + INTERVAL '30 days')::date,
    'active', 210000
  )
  RETURNING id INTO v_kol3_id;

  -- Create campaigns
  INSERT INTO public.campaigns (workspace_id, kol_id, company_id, month, year, status, payout_recommendation)
  VALUES (v_workspace_id, v_kol1_id, v_company_id, v_month, v_year, 'active', 'review')
  RETURNING id INTO v_campaign1_id;

  INSERT INTO public.campaigns (workspace_id, kol_id, company_id, month, year, status, payout_recommendation)
  VALUES (v_workspace_id, v_kol2_id, v_company_id, v_month, v_year, 'at_risk', 'hold')
  RETURNING id INTO v_campaign2_id;

  INSERT INTO public.campaigns (workspace_id, kol_id, company_id, month, year, status, payout_recommendation)
  VALUES (v_workspace_id, v_kol3_id, v_company_id, v_month, v_year, 'active', 'pay')
  RETURNING id INTO v_campaign3_id;

  -- Deliverables
  INSERT INTO public.deliverables (campaign_id, original_tweets, company_mentions, handle_tags, quote_tweets, replies_interactions, newsletter_mention, space_participation)
  VALUES (v_campaign1_id, 8, 4, 2, 1, 3, true, false);

  INSERT INTO public.deliverables (campaign_id, original_tweets, company_mentions, handle_tags, quote_tweets, replies_interactions, newsletter_mention, space_participation)
  VALUES (v_campaign2_id, 6, 3, 2, 1, 2, false, true);

  INSERT INTO public.deliverables (campaign_id, original_tweets, company_mentions, handle_tags, quote_tweets, replies_interactions, newsletter_mention, space_participation)
  VALUES (v_campaign3_id, 10, 5, 3, 2, 4, true, true);

  -- Sample tracked posts for KOL 1
  INSERT INTO public.tracked_posts (campaign_id, kol_id, tweet_id, tweet_url, tweet_text, tweet_type, likes, replies, reposts, views, posted_at)
  VALUES
    (v_campaign1_id, v_kol1_id, 'demo-1001', 'https://x.com/alexcrypto/status/demo-1001',
     'Just checked out @acmeprotocol — the yield is insane right now. $ACME is seriously undervalued.',
     'mention', 234, 45, 78, 12500, NOW() - INTERVAL '5 days'),
    (v_campaign1_id, v_kol1_id, 'demo-1002', 'https://x.com/alexcrypto/status/demo-1002',
     'Big alpha: @acmeprotocol just released their v2. Here''s what you need to know 🧵',
     'handle_tag', 456, 89, 234, 45000, NOW() - INTERVAL '8 days'),
    (v_campaign1_id, v_kol1_id, 'demo-1003', 'https://x.com/alexcrypto/status/demo-1003',
     'My top 5 DeFi protocols this month. Thread 👇',
     'original', 123, 34, 56, 8900, NOW() - INTERVAL '12 days'),
    (v_campaign1_id, v_kol1_id, 'demo-1004', 'https://x.com/alexcrypto/status/demo-1004',
     'The acme protocol team is shipping fast. Bullish on $ACME',
     'mention', 189, 23, 67, 9800, NOW() - INTERVAL '15 days');

  -- Sample tracked posts for KOL 3 (high performer)
  INSERT INTO public.tracked_posts (campaign_id, kol_id, tweet_id, tweet_url, tweet_text, tweet_type, likes, replies, reposts, views, posted_at)
  VALUES
    (v_campaign3_id, v_kol3_id, 'demo-3001', 'https://x.com/defidave/status/demo-3001',
     'Why @acmeprotocol is the best yield protocol in DeFi. My full analysis 🧵',
     'handle_tag', 1200, 234, 567, 98000, NOW() - INTERVAL '3 days'),
    (v_campaign3_id, v_kol3_id, 'demo-3002', 'https://x.com/defidave/status/demo-3002',
     'acme protocol TVL just hit all time high. $ACME is going places.',
     'mention', 890, 156, 432, 67000, NOW() - INTERVAL '7 days'),
    (v_campaign3_id, v_kol3_id, 'demo-3003', 'https://x.com/defidave/status/demo-3003',
     'My DeFi portfolio update for this month. Sharing my top holds.',
     'original', 567, 89, 234, 34000, NOW() - INTERVAL '10 days'),
    (v_campaign3_id, v_kol3_id, 'demo-3004', 'https://x.com/defidave/status/demo-3004',
     'Full breakdown of acme protocol tokenomics',
     'original', 345, 67, 189, 28000, NOW() - INTERVAL '14 days'),
    (v_campaign3_id, v_kol3_id, 'demo-3005', 'https://x.com/defidave/status/demo-3005',
     'RT with comment: Great points on @acmeprotocol utility',
     'quote_tweet', 234, 45, 123, 19000, NOW() - INTERVAL '18 days');

  -- Manual log for KOL 3 (newsletter mention)
  INSERT INTO public.manual_logs (campaign_id, kol_id, deliverable_type, date, link, notes, views, likes)
  VALUES (
    v_campaign3_id, v_kol3_id, 'newsletter_mention',
    (NOW() - INTERVAL '7 days')::date,
    'https://defidave.substack.com/p/week-23',
    'Featured in weekly DeFi newsletter, section 3',
    15000, 89
  );

  RAISE NOTICE 'Seed data inserted successfully for workspace: %', v_workspace_id;
END $$;
