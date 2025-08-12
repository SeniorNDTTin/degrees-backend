const unixCrypt = require('unix-crypt-td-js');

type BenchmarkResult = {
  size: number;
  avgMs: number;
  samples: number[];
};

const sizes = [100, 1000, 5000, 10000, 50000, 100000];
const iterationsPerCell = 5;
const warmup = 1;
const salt = 'ab';

function hrtimeMs(start: bigint, end: bigint) {
  return Number(end - start) / 1_000_000;
}

async function benchOne(size: number, iters: number): Promise<BenchmarkResult> {
  const data = 'a'.repeat(size);
  const samples: number[] = [];

  for (let w = 0; w < warmup; w++) {
    unixCrypt(data, salt);
  }

  for (let i = 0; i < iters; i++) {
    const t0 = process.hrtime.bigint();
    unixCrypt(data, salt);
    const t1 = process.hrtime.bigint();
    samples.push(hrtimeMs(t0, t1));
    await new Promise((r) => setTimeout(r, 10));
  }

  const sum = samples.reduce((a, b) => a + b, 0);
  const avgMs = sum / samples.length;
  return { size, avgMs, samples };
}

export default async function benchDesCrypt() {
  console.log('DES-crypt (Unix) benchmark starting...');
  const results: BenchmarkResult[] = [];

  for (const s of sizes) {
    process.stdout.write(`size=${s} bytes ... `);
    const res = await benchOne(s, iterationsPerCell);
    results.push(res);
    console.log(`avg ${res.avgMs.toFixed(4)} ms`);
  }
}
