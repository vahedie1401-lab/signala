export async function retry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: () => Promise<any>,

  times = 5,
) {
  let last;

  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (err) {
      last = err;
    }
  }

  throw last;
}
