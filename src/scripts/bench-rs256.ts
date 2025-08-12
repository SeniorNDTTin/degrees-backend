import * as crypto from 'crypto';

type BenchmarkResult = {
  size: number;
  rounds: number;
  avgMs: number;
  samples: number[];
};

const sizes = [100, 1000, 5000, 10000, 50000, 100000];
const iterationsPerCell = 5;
const warmup = 1;

function hrtimeMs(start: bigint, end: bigint) {
  return Number(end - start) / 1_000_000;
}

async function benchOne(
  size: number,
  rounds: number,
  iters: number,
): Promise<BenchmarkResult> {
  const data = Buffer.alloc(size, 'a');
  const samples: number[] = [];

  const { privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicExponent: 0x10001,
  });

  for (let w = 0; w < warmup; w++) {
    crypto.sign('sha256', data, privateKey);
  }

  for (let i = 0; i < iters; i++) {
    const t0 = process.hrtime.bigint();
    crypto.sign('sha256', data, privateKey);
    const t1 = process.hrtime.bigint();
    samples.push(hrtimeMs(t0, t1));
    await new Promise((r) => setTimeout(r, 10));
  }

  const sum = samples.reduce((a, b) => a + b, 0);
  const avgMs = sum / samples.length;
  return { size, rounds, avgMs, samples };
}

export default async function benchRS256() {
  console.log('RS256 (RSA-SHA256) benchmark starting...');
  const results: BenchmarkResult[] = [];

  for (const s of sizes) {
    process.stdout.write(`size=${s} bytes ... `);
    const res = await benchOne(s, 1, iterationsPerCell);
    results.push(res);
    console.log(`avg ${res.avgMs.toFixed(4)} ms`);
  }
}
