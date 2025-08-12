import { pbkdf2Sync, randomBytes } from 'crypto';

type BenchmarkResult = {
  size: number;
  iterations: number;
  avgMs: number;
  samples: number[];
};

const sizes = [100, 1000, 5000, 10000, 50000, 100000];
const iterationsList = [1000, 5000, 10000];
const keyLength = 32;
const digest = 'sha256';
const warmup = 1;
const iterationsPerCell = 5;

function hrtimeMs(start: bigint, end: bigint) {
  return Number(end - start) / 1_000_000;
}

async function benchOne(
  size: number,
  iterations: number,
  iters: number,
): Promise<BenchmarkResult> {
  const password = Buffer.alloc(size, 'a');
  const salt = randomBytes(16);
  const samples: number[] = [];

  for (let w = 0; w < warmup; w++) {
    pbkdf2Sync(password, salt, iterations, keyLength, digest);
  }

  for (let i = 0; i < iters; i++) {
    const t0 = process.hrtime.bigint();
    pbkdf2Sync(password, salt, iterations, keyLength, digest);
    const t1 = process.hrtime.bigint();
    samples.push(hrtimeMs(t0, t1));
    await new Promise((r) => setTimeout(r, 10));
  }

  const avgMs = samples.reduce((a, b) => a + b, 0) / samples.length;
  return { size, iterations, avgMs, samples };
}

export default async function benchPBKDF2LowRounds() {
  console.log(`PBKDF2 benchmark starting... (low iterations)`);
  const results: BenchmarkResult[] = [];

  for (const iter of iterationsList) {
    for (const s of sizes) {
      process.stdout.write(`size=${s} bytes, iter=${iter} ... `);
      const res = await benchOne(s, iter, iterationsPerCell);
      results.push(res);
      console.log(`avg ${res.avgMs.toFixed(4)} ms`);
    }
  }
}
