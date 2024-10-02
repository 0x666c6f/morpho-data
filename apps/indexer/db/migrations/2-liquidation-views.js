module.exports = class LiquidationViews00000000000002 {
  name = "LiquidationViews00000000000002"

  async up(db) {
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
          CREATE OR REPLACE VIEW aggregated_positions AS WITH positions AS (
          SELECT
            bp.borrower,
            bp.market_id,
            bp.net_borrow_assets,
            sp.net_collateral_assets,
            la.symbol AS loan_asset_symbol,
            la.decimals AS loan_asset_decimals,
            ca.symbol AS collateral_asset_symbol,
            ca.decimals AS collateral_asset_decimals,
            ma.lltv AS liquidation_threshold,
            o.price AS oracle_price,
            (sp.net_collateral_assets * o.price) ::double precision / (power(10::double precision,
                ca.decimals::double precision) * '1000000000000000000000000000000000000'::numeric::double precision) AS collateral_value_in_loan_asset,
            (sp.net_collateral_assets * o.price) ::double precision / (power(10::double precision,
                ca.decimals::double precision) * '1000000000000000000000000000000000000'::numeric::double precision) * (ma.lltv / '1000000000000000000'::numeric) ::double precision AS max_borrow_in_loan_asset,
            bp.net_borrow_assets ::double precision / power(10::double precision,
              la.decimals::double precision) AS borrow_assets_in_loan_asset
          FROM
            borrow_positions bp
          LEFT JOIN supply_collateral_positions sp ON bp.borrower = sp.borrower
            AND bp.market_id ::text = sp.market_id ::text
          JOIN create_market ma ON bp.market_id ::text = ma.market_id ::text
          JOIN asset la ON ma.loan_token = la.id ::text
          JOIN asset ca ON ma.collateral_token = ca.id ::text
          JOIN oracle o ON ma.oracle = o.id ::text
        )
        SELECT
          positions.borrower,
          positions.market_id,
          positions.net_borrow_assets,
          positions.net_collateral_assets,
          positions.loan_asset_symbol,
          positions.loan_asset_decimals,
          positions.collateral_asset_symbol,
          positions.collateral_asset_decimals,
          positions.liquidation_threshold,
          positions.oracle_price,
          positions.collateral_value_in_loan_asset,
          positions.max_borrow_in_loan_asset,
          positions.borrow_assets_in_loan_asset,
          CASE WHEN positions.borrow_assets_in_loan_asset > 0::double precision THEN
            positions.borrow_assets_in_loan_asset / positions.max_borrow_in_loan_asset
          ELSE
            NULL::double precision
          END AS ltv,
          CASE WHEN positions.borrow_assets_in_loan_asset > 0::double precision THEN
            positions.max_borrow_in_loan_asset / positions.borrow_assets_in_loan_asset
          ELSE
            NULL::double precision
          END AS health_factor,
          CASE WHEN positions.borrow_assets_in_loan_asset > 0::double precision
            AND(positions.borrow_assets_in_loan_asset / positions.max_borrow_in_loan_asset) > 1::double precision THEN
            TRUE
          ELSE
            FALSE
          END AS is_liquidatable
        FROM
          positions;
    `)
  }

  async down(db) {}
}
