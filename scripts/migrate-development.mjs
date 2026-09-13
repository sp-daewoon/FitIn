import { readFileSync, readdirSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { createHash } from 'node:crypto';
import pg from 'pg';
const env = parseEnv(readFileSync('.env.db.local','utf8'));
const app = parseEnv(readFileSync('.env.development.local','utf8'));
if (env.PGHOST !== `db.${new URL(app.EXPO_PUBLIC_SUPABASE_URL).hostname}`)
  throw new Error('DB host must match the development project. Production is not handled by this script.');
// Official download URL used by Supabase Studio. Verify TLS and the database hostname.
const response = await fetch('https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt');
if (!response.ok) throw new Error('Could not download the Supabase CA');
const db = new pg.Client({host:env.PGHOST,port:Number(env.PGPORT||5432),database:env.PGDATABASE,
  user:env.PGUSER,password:env.PGPASSWORD,ssl:{rejectUnauthorized:true,ca:await response.text()},connectionTimeoutMillis:10000});
try {
  await db.connect();
  await db.query('create schema if not exists fitin_private; revoke all on schema fitin_private from public, anon, authenticated');
  await db.query('create table if not exists fitin_private.migrations(name text primary key, hash text not null, applied_at timestamptz default now())');
  for (const name of readdirSync('supabase/migrations').filter(n=>/^\d+_[a-z_]+\.sql$/.test(n)).sort()) {
    const sql=readFileSync(`supabase/migrations/${name}`,'utf8');
    const hash=createHash('sha256').update(sql).digest('hex');
    const prior=await db.query('select hash from fitin_private.migrations where name=$1',[name]);
    if(prior.rows.length){if(prior.rows[0].hash!==hash)throw new Error(`Applied migration changed: ${name}`);continue;}
    await db.query('begin');
    try {
      await db.query(sql.replace(/^begin;\s*$/gmi,'').replace(/^commit;\s*$/gmi,''));
      await db.query('insert into fitin_private.migrations(name,hash) values($1,$2)',[name,hash]);
      await db.query('commit'); console.log(`Applied development migration: ${name}`);
    } catch(error) {await db.query('rollback'); throw error;}
  }
} catch(error) {console.error('Migration failed:',error.code||error.name, String(error.message).replaceAll(env.PGPASSWORD,'[redacted]'));process.exitCode=1;}
finally {await db.end();}
