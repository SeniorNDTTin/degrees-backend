import { generateKeyPairSync, createSign } from 'crypto';

type BenchmarkResult = {
  size: number;
  avgMs: number;
  samples: number[];
};

const sizes = [100, 1000, 5000, 10000, 50000, 100000];
const iterationsPerCell = 5;
const warmup = 1;

const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

function hrtimeMs(start: bigint, end: bigint) {
  return Number(end - start) / 1_000_000;
}

async function benchOne(size: number, iters: number): Promise<BenchmarkResult> {
  const data = Buffer.alloc(size, 'a');
  const samples: number[] = [];

  for (let w = 0; w < warmup; w++) {
    const sign = createSign('RSA-SHA1');
    sign.update(data);
    sign.sign(privateKey, 'base64');
  }

  for (let i = 0; i < iters; i++) {
    const t0 = process.hrtime.bigint();
    const sign = createSign('RSA-SHA1');
    sign.update(data);
    sign.sign(privateKey, 'base64');
    const t1 = process.hrtime.bigint();
    samples.push(hrtimeMs(t0, t1));
    await new Promise((r) => setTimeout(r, 10));
  }

  const sum = samples.reduce((a, b) => a + b, 0);
  const avgMs = sum / samples.length;
  return { size, avgMs, samples };
}

export default async function benchRsaSha1() {
  console.log('RSA-SHA1 benchmark starting...');
  const results: BenchmarkResult[] = [];

  for (const s of sizes) {
    process.stdout.write(`size=${s} bytes ... `);
    const res = await benchOne(s, iterationsPerCell);
    results.push(res);
    console.log(`avg ${res.avgMs.toFixed(4)} ms`);
  }
}
