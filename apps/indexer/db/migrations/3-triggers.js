module.exports = class Triggers00000000000003 {
  name = "Triggers00000000000003"

  async up(db) {
    await db.query(`CREATE MATERIALIZED VIEW materialized_all_positions_ltv AS
SELECT * FROM all_positions_ltv;

CREATE UNIQUE INDEX ON materialized_all_positions_ltv (position_id);`)
    await db.query(`
CREATE OR REPLACE FUNCTION refresh_position_ltv(p_position_id TEXT)
RETURNS VOID AS $$
BEGIN
    -- Refresh the entire view concurrently
    REFRESH MATERIALIZED VIEW CONCURRENTLY materialized_all_positions_ltv;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_positions_ltv_for_market(p_market_id TEXT)
RETURNS VOID AS $$
BEGIN
    -- Refresh the entire view concurrently
    REFRESH MATERIALIZED VIEW CONCURRENTLY materialized_all_positions_ltv;
END;
$$ LANGUAGE plpgsql;
        `)
    await db.query(`
            CREATE OR REPLACE FUNCTION refresh_positions_view()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY positions;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
            `)

    await db.query(`
                -- Trigger for borrow table
CREATE OR REPLACE FUNCTION trigger_refresh_position_ltv_borrow()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM refresh_position_ltv(NEW.market_id || ':' || NEW.on_behalf);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_position_ltv_after_borrow
AFTER INSERT OR UPDATE ON borrow
FOR EACH ROW EXECUTE FUNCTION trigger_refresh_position_ltv_borrow();

-- Trigger for repay table
CREATE OR REPLACE FUNCTION trigger_refresh_position_ltv_repay()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM refresh_position_ltv(NEW.market_id || ':' || NEW.on_behalf);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_position_ltv_after_repay
AFTER INSERT OR UPDATE ON repay
FOR EACH ROW EXECUTE FUNCTION trigger_refresh_position_ltv_repay();

-- Trigger for liquidate table
CREATE OR REPLACE FUNCTION trigger_refresh_position_ltv_liquidate()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM refresh_position_ltv(NEW.market_id || ':' || NEW.borrower);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_position_ltv_after_liquidate
AFTER INSERT OR UPDATE ON liquidate
FOR EACH ROW EXECUTE FUNCTION trigger_refresh_position_ltv_liquidate();

-- Trigger for supply_collateral table
CREATE OR REPLACE FUNCTION trigger_refresh_position_ltv_supply_collateral()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM refresh_position_ltv(NEW.market_id || ':' || NEW.on_behalf);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_position_ltv_after_supply_collateral
AFTER INSERT OR UPDATE ON supply_collateral
FOR EACH ROW EXECUTE FUNCTION trigger_refresh_position_ltv_supply_collateral();

-- Trigger for withdraw_collateral table
CREATE OR REPLACE FUNCTION trigger_refresh_position_ltv_withdraw_collateral()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM refresh_position_ltv(NEW.market_id || ':' || NEW.on_behalf);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_position_ltv_after_withdraw_collateral
AFTER INSERT OR UPDATE ON withdraw_collateral
FOR EACH ROW EXECUTE FUNCTION trigger_refresh_position_ltv_withdraw_collateral();

-- Trigger for create_market table
CREATE OR REPLACE FUNCTION trigger_refresh_positions_ltv_create_market()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM refresh_positions_ltv_for_market(NEW.market_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_positions_ltv_after_create_market
AFTER INSERT OR UPDATE ON create_market
FOR EACH ROW EXECUTE FUNCTION trigger_refresh_positions_ltv_create_market();

-- Trigger for oracle table
CREATE OR REPLACE FUNCTION trigger_refresh_positions_ltv_oracle()
RETURNS TRIGGER AS $$
DECLARE
    affected_market_id TEXT;
BEGIN
    -- Find all markets that use this oracle and refresh their positions
    FOR affected_market_id IN
        SELECT market_id
        FROM create_market
        WHERE oracle = NEW.id
    LOOP
        PERFORM refresh_positions_ltv_for_market(affected_market_id);
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_positions_ltv_after_oracle_update
AFTER UPDATE OF price ON oracle
FOR EACH ROW EXECUTE FUNCTION trigger_refresh_positions_ltv_oracle();

-- Trigger for accrue_interest table
CREATE OR REPLACE FUNCTION trigger_refresh_positions_ltv_accrue_interest()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM refresh_positions_ltv_for_market(NEW.market_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_positions_ltv_after_accrue_interest
AFTER INSERT OR UPDATE ON accrue_interest
FOR EACH ROW EXECUTE FUNCTION trigger_refresh_positions_ltv_accrue_interest();
`)
  }

  async down(db) {}
}
