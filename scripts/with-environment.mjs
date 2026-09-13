import { readFileSync, existsSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { spawn } from 'node:child_process';
import { resolveEnvironment } from '../config/environment.cjs';

const [name, command, ...args] = process.argv.slice(2);
if (!['development', 'production'].includes(name) || !command) {
  throw new Error('Usage: with-environment.mjs development|production command [args]');
}
const env = { ...process.env, FITIN_ENV: name, EXPO_NO_DOTENV: '1' };
const path = `.env.${name}.local`;
if (existsSync(path)) Object.assign(env, parseEnv(readFileSync(path, 'utf8')));
if (existsSync('.env.development.local')) {
  env.FITIN_DEVELOPMENT_SUPABASE_URL = parseEnv(readFileSync('.env.development.local', 'utf8')).EXPO_PUBLIC_SUPABASE_URL;
}
resolveEnvironment(env);
const child = spawn(command, args, { env, stdio: 'inherit', shell: false });
child.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
child.on('exit', (code) => { process.exitCode = code ?? 1; });
