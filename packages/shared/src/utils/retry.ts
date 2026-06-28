export async function retry(
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
