import * as bcrypt from 'bcrypt';

type BenchmarkResult = {
  size: number;
  rounds: number;
  avgMs: number;
  samples: number[];
};

const sizes = [100, 1000, 5000, 10000, 50000, 100000];
const roundsList = [10, 12];
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
  const data = Buffer.alloc(size, 'a'); // payload
  const samples: number[] = [];

  for (let w = 0; w < warmup; w++) {
    await bcrypt.hash(data, rounds);
  }

  for (let i = 0; i < iters; i++) {
    const t0 = process.hrtime.bigint();
    await bcrypt.hash(data, rounds);
    const t1 = process.hrtime.bigint();
    samples.push(hrtimeMs(t0, t1));
    await new Promise((r) => setTimeout(r, 10));
  }

  const sum = samples.reduce((a, b) => a + b, 0);
  const avgMs = sum / samples.length;
  return { size, rounds, avgMs, samples };
}

export default async function benchBcrypt() {
  console.log('Bcrypt benchmark starting...');
  const results: BenchmarkResult[] = [];

  for (const r of roundsList) {
    console.log(`\n=== rounds = ${r} ===`);
    for (const s of sizes) {
      process.stdout.write(`size=${s} bytes ... `);
      const res = await benchOne(s, r, iterationsPerCell);
      results.push(res);
      console.log(`avg ${res.avgMs.toFixed(2)} ms`);
    }
  }
}
