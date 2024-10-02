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

      CREATE OR REPLACE FUNCTION to_assets_up(shares numeric, total_assets numeric, total_shares numeric) RETURNS numeric AS $$
      BEGIN
          RETURN mul_div_up(shares, total_assets + get_virtual_assets(), total_shares + get_virtual_shares());
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;

      CREATE OR REPLACE FUNCTION to_assets_down(shares numeric, total_assets numeric, total_shares numeric) RETURNS numeric AS $$
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

    await db.query(`
      CREATE OR REPLACE VIEW borrow_positions AS
      SELECT
        borrower,
        market_id,
        SUM(
          borrowed_shares) - SUM(
          repaid_shares) - SUM(
          liquidated_shares) AS net_borrow_shares,
        SUM(
          borrowed_assets) - SUM(
          repaid_assets) - SUM(
          liquidated_assets) AS net_borrow_assets
      FROM (
        SELECT
          be.on_behalf AS borrower,
          be.market_id,
          be.shares AS borrowed_shares,
          be.assets AS borrowed_assets,
          0 AS repaid_shares,
          0 AS repaid_assets,
          0 AS liquidated_shares,
          0 AS liquidated_assets
        FROM
          borrow be
        UNION ALL
        SELECT
          re.on_behalf AS borrower,
          re.id,
          0 AS borrowed_shares,
          0 AS borrowed_assets,
          re.shares AS repaid_shares,
          re.assets AS repaid_assets,
          0 AS liquidated_shares,
          0 AS liquidated_assets
        FROM
          repay re
        UNION ALL
        SELECT
          le.borrower,
          le.market_id,
          0 AS borrowed_shares,
          0 AS borrowed_assets,
          0 AS repaid_shares,
          0 AS repaid_assets,
          (le.repaid_shares + le.bad_debt_shares) AS liquidated_shares,
          le.repaid_assets AS liquidated_assets
        FROM
          liquidate le) AS events
      GROUP BY
        borrower,
        market_id
      HAVING
        SUM(
          borrowed_shares) - SUM(
          repaid_shares) - SUM(
          liquidated_shares) > 0;
    `)
    await db.query(`
      CREATE VIEW supply_collateral_positions AS
      SELECT
        borrower,
        market_id,
        SUM(
          supplied_assets) - SUM(
          withdrawn_assets) - SUM(
          seized_assets) AS net_collateral_assets
      FROM (
        SELECT
          sce.on_behalf AS borrower,
          sce.market_id,
          sce.assets AS supplied_assets,
          0 AS withdrawn_assets,
          0 AS seized_assets
        FROM
          supply_collateral sce
        UNION ALL
        SELECT
          wce.on_behalf,
          wce.market_id,
          0 AS supplied_assets,
          wce.assets AS withdrawn_assets,
          0 AS seized_assets
        FROM
          withdraw_collateral wce
        UNION ALL
        SELECT
          le.borrower,
          le.market_id,
          0 AS supplied_assets,
          0 AS withdrawn_assets,
          le.seized_assets AS seized_assets
        FROM
          liquidate le) AS events
      GROUP BY
        borrower,
        market_id
      HAVING
        SUM(
          supplied_assets) - SUM(
          withdrawn_assets) - SUM(
          seized_assets) > 0;
    `)
    await db.query(`
        CREATE OR REPLACE VIEW positions AS
        WITH market_totals AS (
          SELECT
            b.market_id,
            SUM(b.assets) AS total_borrowed,
            COALESCE((SELECT SUM(ai.interest) FROM accrue_interest ai WHERE ai.market_id = b.market_id), 0) AS total_interest,
            SUM(b.shares) AS total_shares,
            MAX((SELECT MAX(ai.block_timestamp) FROM accrue_interest ai WHERE ai.market_id = b.market_id)) AS last_accrual_timestamp,
            MAX((SELECT MAX(ai.prev_borrow_rate) FROM accrue_interest ai WHERE ai.market_id = b.market_id)) AS latest_borrow_rate
          FROM borrow b
          GROUP BY b.market_id
        )
        SELECT
          b.on_behalf AS borrower,
          b.market_id,
          b.shares AS borrow_shares,
          (to_assets_up(
            b.shares,
            (mt.total_borrowed + mt.total_interest +
              w_mul_down(
                mt.total_borrowed + mt.total_interest,
                w_taylor_compounded(
                  mt.latest_borrow_rate,
                  EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mt.last_accrual_timestamp))::numeric
                )
              )
            )::numeric,
            mt.total_shares
          ) * get_morpho_scaling_factor(b.market_id::TEXT))::numeric(38,0) AS borrow_assets,
          COALESCE(sc.assets, 0) AS collateral_assets,
          mt.last_accrual_timestamp,
          mt.latest_borrow_rate AS current_borrow_rate
        FROM
          borrow b
          JOIN market_totals mt ON b.market_id = mt.market_id
          LEFT JOIN LATERAL (
            SELECT assets
            FROM supply_collateral
            WHERE on_behalf = b.on_behalf AND market_id = b.market_id
            ORDER BY block_timestamp DESC
            LIMIT 1
          ) sc ON TRUE;

    `)
    await db.query(`
          CREATE OR REPLACE VIEW aggregated_positions AS
SELECT
    p.*,
    cm.lltv AS lltv,
    CASE
        WHEN p.collateral_assets > 0 AND o.price > 0 THEN
            (p.borrow_assets * 1e18::numeric / NULLIF(
                mul_div_down(p.collateral_assets, o.price, '1000000000000000000000000000000000000'::numeric) * cm.lltv / 1e18,
                0
            ))::numeric(78,0)
        ELSE
            0::numeric(78,0)
    END AS ltv,
    CASE
        WHEN p.collateral_assets > 0 AND o.price > 0 AND cm.lltv > 0 THEN
            NULLIF(
                mul_div_down(p.collateral_assets, o.price, '1000000000000000000000000000000000000'::numeric) * cm.lltv / 1e18,
                0
            ) / p.borrow_assets
        ELSE
            NULL::numeric
    END AS health_factor,
    CASE
        WHEN p.collateral_assets > 0 AND o.price > 0 AND cm.lltv > 0 THEN
            (p.borrow_assets * 1e18::numeric / NULLIF(
                mul_div_down(p.collateral_assets, o.price, '1000000000000000000000000000000000000'::numeric) * cm.lltv / 1e18,
                0
            ))::numeric(78,0) >= 1e18::numeric(78,0)
        ELSE
            FALSE
    END AS is_liquidatable
FROM
    positions p
JOIN create_market cm ON p.market_id = cm.market_id
JOIN oracle o ON cm.oracle = o.id;
    `)
  }

  async down(db) {}
}
