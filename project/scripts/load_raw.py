from pathlib import Path
import duckdb

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "core-v1" / "raw"
DB = ROOT / "project" / "warehouse" / "fiction_cloud.duckdb"
DB.parent.mkdir(parents=True, exist_ok=True)

folders = {
    "raw_crm": RAW / "crm",
    "raw_marketing": RAW / "marketing",
    "raw_finance": RAW / "finance",
    "raw_identity": RAW / "identity",
}

con = duckdb.connect(str(DB))

for schema, folder in folders.items():
    con.execute(f'create schema if not exists "{schema}"')
    for path in sorted(folder.glob("*.csv")):
        table = path.stem.replace('"', '""')
        sql = f'''create or replace table "{schema}"."{table}" as
select * from read_csv(?, header=true, all_varchar=true)'''
        con.execute(sql, [str(path)])

inventory = []

for schema, folder in folders.items():
    for path in sorted(folder.glob("*.csv")):
        table = path.stem.replace('"', '""')
        row_count = con.execute(
            f'select count(*) from "{schema}"."{table}"'
        ).fetchone()[0]
        inventory.append((schema, table, row_count))

inventory.sort()

for row in inventory:
    print(row)

print("tables=", len(inventory), "rows=", sum(r[2] for r in inventory))

con.close()