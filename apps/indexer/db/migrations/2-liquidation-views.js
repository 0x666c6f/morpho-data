module.exports = class LiquidationViews00000000000002 {
  name = "LiquidationViews00000000000002"

  async up(db) {
    await db.query(`
      -- Indexes for borrow table
      CREATE INDEX idx_borrow_on_behalf ON borrow(on_behalf);
      CREATE INDEX idx_borrow_market_id ON borrow(market_id);
      CREATE INDEX idx_borrow_on_behalf_market_id ON borrow(on_behalf, market_id);

      -- Indexes for repay table
      CREATE INDEX idx_repay_on_behalf ON repay(on_behalf);
      CREATE INDEX idx_repay_market_id ON repay(market_id);
      CREATE INDEX idx_repay_on_behalf_market_id ON repay(on_behalf, market_id);

      -- Indexes for liquidate table
      CREATE INDEX idx_liquidate_borrower ON liquidate(borrower);
      CREATE INDEX idx_liquidate_market_id ON liquidate(market_id);
      CREATE INDEX idx_liquidate_borrower_market_id ON liquidate(borrower, market_id);

      -- Indexes for supply_collateral table
      CREATE INDEX idx_supply_collateral_on_behalf ON supply_collateral(on_behalf);
      CREATE INDEX idx_supply_collateral_market_id ON supply_collateral(market_id);
      CREATE INDEX idx_supply_collateral_on_behalf_market_id ON supply_collateral(on_behalf, market_id);

      -- Indexes for withdraw_collateral table
      CREATE INDEX idx_withdraw_collateral_on_behalf ON withdraw_collateral(on_behalf);
      CREATE INDEX idx_withdraw_collateral_market_id ON withdraw_collateral(market_id);
      CREATE INDEX idx_withdraw_collateral_on_behalf_market_id ON withdraw_collateral(on_behalf, market_id);

      -- Indexes for create_market table
      CREATE INDEX idx_create_market_market_id ON create_market(market_id);
      CREATE INDEX idx_create_market_oracle ON create_market(oracle);
      CREATE INDEX idx_create_market_loan_token ON create_market(loan_token);
      CREATE INDEX idx_create_market_collateral_token ON create_market(collateral_token);

      -- Indexes for oracle table
      CREATE INDEX idx_oracle_id ON oracle(id);

      -- Indexes for asset table
      CREATE INDEX idx_asset_id ON asset(id);

      -- Indexes for accrue_interest table
      CREATE INDEX idx_accrue_interest_market_id ON accrue_interest(market_id);
      CREATE INDEX idx_accrue_interest_block_timestamp ON accrue_interest(block_timestamp);
      CREATE INDEX idx_accrue_interest_market_id_block_timestamp ON accrue_interest(market_id, block_timestamp);

      -- Additional indexes for timestamp-based queries
      CREATE INDEX idx_borrow_block_timestamp ON borrow(block_timestamp);
      CREATE INDEX idx_supply_collateral_block_timestamp ON supply_collateral(block_timestamp);
      CREATE INDEX idx_repay_block_timestamp ON repay(block_timestamp);
      CREATE INDEX idx_liquidate_block_timestamp ON liquidate(block_timestamp);
      CREATE INDEX idx_withdraw_collateral_block_timestamp ON withdraw_collateral(block_timestamp);

      -- For the borrow table
      CREATE INDEX idx_borrow_assets ON borrow(assets);

      -- For the repay table
      CREATE INDEX idx_repay_assets ON repay(assets);

      -- For the accrue_interest table
      CREATE INDEX idx_accrue_interest_interest ON accrue_interest(interest);
      CREATE INDEX idx_accrue_interest_prev_borrow_rate ON accrue_interest(prev_borrow_rate);

      -- For the liquidate table
      CREATE INDEX idx_liquidate_repaid_assets ON liquidate(repaid_assets);

      CREATE INDEX idx_accrue_interest_market_id_prev_borrow_rate
ON accrue_interest(market_id, prev_borrow_rate);

CREATE INDEX idx_supply_collateral_market_id_assets ON supply_collateral(market_id, assets);
CREATE INDEX idx_withdraw_collateral_market_id_assets ON withdraw_collateral(market_id, assets);
CREATE INDEX idx_borrow_market_id_assets ON borrow(market_id, assets);
CREATE INDEX idx_repay_market_id_assets ON repay(market_id, assets);
CREATE INDEX idx_accrue_interest_market_id_interest ON accrue_interest(market_id, interest);

CREATE INDEX idx_liquidate_market_id_repaid_seized_assets
ON liquidate(market_id, repaid_assets, seized_assets);
    `)
    await db.query(`
      -- Constants
      CREATE OR REPLACE FUNCTION get_wad() RETURNS numeric AS $$
      BEGIN
          RETURN 1e18::numeric;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;

      CREATE OR REPLACE FUNCTION get_virtual_assets() RETURNS numeric AS $$
      BEGIN
          RETURN 1e9::numeric;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;

      CREATE OR REPLACE FUNCTION get_virtual_shares() RETURNS numeric AS $$
      BEGIN
          RETURN 1e9::numeric;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;

      -- Helper functions
      CREATE OR REPLACE FUNCTION mul_div_up(x numeric, y numeric, z numeric) RETURNS numeric AS $$
      BEGIN
          RETURN (x * y + (z - 1)) / z;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;

      CREATE OR REPLACE FUNCTION mul_div_down(x numeric, y numeric, z numeric) RETURNS numeric AS $$
      BEGIN
          RETURN (x * y) / z;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;

      CREATE OR REPLACE FUNCTION w_mul_down(x numeric, y numeric) RETURNS numeric AS $$
      BEGIN
          RETURN (x * y) / get_wad();
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;

      CREATE OR REPLACE FUNCTION w_div_up(x numeric, y numeric) RETURNS numeric AS $$
      BEGIN
          RETURN (x * get_wad() + y - 1) / y;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;

      CREATE OR REPLACE FUNCTION w_taylor_compounded(x numeric, n numeric) RETURNS numeric AS $$
      DECLARE
          first_term numeric;
          second_term numeric;
          third_term numeric;
      BEGIN
          first_term := x * n;
          second_term := mul_div_down(first_term, first_term, 1e18::numeric * 2);
          third_term := mul_div_down(second_term, first_term, 1e18::numeric * 3);
          RETURN first_term + second_term + third_term;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;

      CREATE OR REPLACE FUNCTION to_assets_up(shares numeric, total_assets numeric, total_shares numeric)
      RETURNS numeric AS $$
      BEGIN
          RETURN mul_div_up(shares, total_assets + get_virtual_assets(), total_shares + get_virtual_shares());
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;

      CREATE OR REPLACE FUNCTION to_assets_down(shares numeric, total_assets numeric, total_shares numeric)
      RETURNS numeric AS $$
      BEGIN
          RETURN mul_div_down(shares, total_assets + get_virtual_assets(), total_shares + get_virtual_shares());
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;

      CREATE OR REPLACE FUNCTION get_morpho_scaling_factor()
      RETURNS NUMERIC AS $$
      BEGIN
          RETURN 1.1417;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;

    `)

    // market totals
    await db.query(`
      CREATE OR REPLACE VIEW market_totals_view AS
WITH market_data AS (
    SELECT market_id, SUM(assets) AS total_assets, 0 AS total_shares, 'supply_collateral' AS type
    FROM supply_collateral
    GROUP BY market_id
    UNION ALL
    SELECT market_id, -SUM(assets) AS total_assets, 0 AS total_shares, 'withdraw_collateral' AS type
    FROM withdraw_collateral
    GROUP BY market_id
    UNION ALL
    SELECT market_id, SUM(assets) AS total_assets, SUM(shares) AS total_shares, 'borrow' AS type
    FROM borrow
    GROUP BY market_id
    UNION ALL
    SELECT market_id, -SUM(assets) AS total_assets, -SUM(shares) AS total_shares, 'repay' AS type
    FROM repay
    GROUP BY market_id
    UNION ALL
    SELECT market_id, SUM(interest) AS total_assets, 0 AS total_shares, 'accrue_interest' AS type
    FROM accrue_interest
    GROUP BY market_id
    UNION ALL
    SELECT market_id, -SUM(repaid_assets) AS total_assets, -SUM(repaid_shares + bad_debt_shares) AS total_shares, 'liquidation' AS type
    FROM liquidate
    GROUP BY market_id
)
SELECT
    market_id,
    SUM(CASE WHEN type = 'supply_collateral' THEN GREATEST(total_assets, 0) ELSE 0 END) AS supply_collateral_total,
    SUM(CASE WHEN type = 'withdraw_collateral' THEN GREATEST(-total_assets, 0) ELSE 0 END) AS withdraw_collateral_total,
    SUM(CASE WHEN type = 'borrow' THEN GREATEST(total_assets, 0) ELSE 0 END) AS borrow_total,
    SUM(CASE WHEN type = 'repay' THEN GREATEST(-total_assets, 0) ELSE 0 END) AS repay_total,
    SUM(CASE WHEN type = 'accrue_interest' THEN GREATEST(total_assets, 0) ELSE 0 END) AS accrue_interest_total,
    SUM(CASE WHEN type = 'liquidation' THEN GREATEST(-total_assets, 0) ELSE 0 END) AS liquidation_total,
    SUM(CASE WHEN type IN ('borrow', 'repay', 'liquidation') THEN total_shares ELSE 0 END) AS borrow_shares_total
FROM market_data
GROUP BY market_id;

CREATE OR REPLACE VIEW current_market_borrow_state AS
SELECT
    market_id,
    borrow_shares_total AS current_borrow_shares,
    borrow_total - repay_total - liquidation_total + accrue_interest_total AS current_borrow_assets_with_interest
FROM market_totals_view;
    `)

    await db.query(`
      CREATE OR REPLACE VIEW positions AS
WITH position_events AS (
    -- Borrow events
    SELECT market_id || ':' || on_behalf AS id, market_id, on_behalf AS borrower,
           SUM(shares) AS borrow_shares, SUM(assets) AS borrow_amount, 0 AS collateral_amount
    FROM borrow
    GROUP BY market_id, on_behalf

    UNION ALL

    -- Repay events
    SELECT market_id || ':' || on_behalf AS id, market_id, on_behalf AS borrower,
           -SUM(shares) AS borrow_shares, -SUM(assets) AS borrow_amount, 0 AS collateral_amount
    FROM repay
    GROUP BY market_id, on_behalf

    UNION ALL

    -- Liquidation events (for borrower)
    SELECT market_id || ':' || borrower AS id, market_id, borrower,
           -SUM(repaid_shares + bad_debt_shares) AS borrow_shares,
           -SUM(repaid_assets) AS borrow_amount,
           -SUM(seized_assets) AS collateral_amount
    FROM liquidate
    GROUP BY market_id, borrower

    UNION ALL

    -- Supply Collateral events
    SELECT market_id || ':' || on_behalf AS id, market_id, on_behalf AS borrower,
           0 AS borrow_shares, 0 AS borrow_amount, SUM(assets) AS collateral_amount
    FROM supply_collateral
    GROUP BY market_id, on_behalf

    UNION ALL

    -- Withdraw Collateral events
    SELECT market_id || ':' || on_behalf AS id, market_id, on_behalf AS borrower,
           0 AS borrow_shares, 0 AS borrow_amount, -SUM(assets) AS collateral_amount
    FROM withdraw_collateral
    GROUP BY market_id, on_behalf
)
SELECT
    pe.id,
    pe.market_id,
    pe.borrower,
    GREATEST(SUM(pe.borrow_shares), 0) AS borrow_shares,
    CASE
        WHEN GREATEST(SUM(pe.borrow_shares), 0) > 0 THEN
            GREATEST(
                (GREATEST(SUM(pe.borrow_shares), 0) * cmbs.current_borrow_assets_with_interest) / cmbs.current_borrow_shares,
                GREATEST(SUM(pe.borrow_amount), 0)
            )
        ELSE 0
    END AS borrow_amount,
    GREATEST(SUM(pe.collateral_amount), 0) AS collateral_amount
FROM position_events pe
LEFT JOIN current_market_borrow_state cmbs ON pe.market_id = cmbs.market_id
GROUP BY pe.id, pe.market_id, pe.borrower, cmbs.current_borrow_assets_with_interest, cmbs.current_borrow_shares
HAVING GREATEST(SUM(pe.borrow_shares), 0) > 0 OR GREATEST(SUM(pe.collateral_amount), 0) > 0;
      `)
  }

  async down(db) {}
}
