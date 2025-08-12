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

function pbkdf2Async(
  password: Buffer | string,
  salt: Buffer | string,
  iterations: number,
  keylen: number,
  digest: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      iterations,
      keylen,
      digest,
      (err, derived) => {
        if (err) reject(err);
        else resolve(derived);
      },
    );
  });
}

async function benchOne(
  size: number,
  rounds: number,
  iters: number,
): Promise<BenchmarkResult> {
  const password = Buffer.alloc(size, 'a');
  const samples: number[] = [];

  const salt = crypto.randomBytes(16);
  const keyLen = 20;
  const digest = 'sha1';

  for (let w = 0; w < warmup; w++) {
    await pbkdf2Async(password, salt, rounds, keyLen, digest);
  }

  for (let i = 0; i < iters; i++) {
    const t0 = process.hrtime.bigint();

    const saltedPassword = await pbkdf2Async(
      password,
      salt,
      rounds,
      keyLen,
      digest,
    );

    const clientKey = crypto
      .createHmac('sha1', saltedPassword)
      .update('Client Key')
      .digest();

    const storedKey = crypto.createHash('sha1').update(clientKey).digest();

    const authMessage = password; // chỉ để benchmark; có thể thay bằng Buffer khác

    const clientSignature = crypto
      .createHmac('sha1', storedKey)
      .update(authMessage)
      .digest();

    const t1 = process.hrtime.bigint();
    samples.push(hrtimeMs(t0, t1));

    await new Promise((r) => setTimeout(r, 10));
  }

  const sum = samples.reduce((a, b) => a + b, 0);
  const avgMs = sum / samples.length;
  return { size, rounds, avgMs, samples };
}

export default async function benchSCRAMSHA1() {
  console.log('SCRAM-SHA-1 benchmark starting...');
  const results: BenchmarkResult[] = [];

  const iterations = 4096;

  for (const s of sizes) {
    process.stdout.write(`size=${s} bytes ... `);
    const res = await benchOne(s, iterations, iterationsPerCell);
    results.push(res);
    console.log(`avg ${res.avgMs.toFixed(4)} ms`);
  }
}
