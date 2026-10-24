import { optionsFromFlags, takeSample } from '../core/sample.mjs';
import { printSample } from '../core/format.mjs';

export default async function watch({ flags }) {
  const opts = optionsFromFlags(flags);
  for (;;) {
    const sample = await takeSample(opts);
    printSample(sample, opts.top);
    await new Promise((r) => setTimeout(r, opts.intervalSec * 1000));
  }
}
