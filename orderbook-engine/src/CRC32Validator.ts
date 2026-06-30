export class CRC32Validator {
  validate(
    checksum: number,

    calculated: number,
  ) {
    return checksum === calculated;
  }
}
//بعداً crc32 واقعی اضافه می‌کنیم.
