import { optionsFromFlags, takeSample } from '../core/sample.mjs';
import { printSample } from '../core/format.mjs';

export default async function once({ flags }) {
  const opts = optionsFromFlags(flags);
  const sample = await takeSample(opts);
  printSample(sample, opts.top);
  return 0;
}
