// Builds ZIP files for the tests, including broken and hostile ones: every field the reader looks at can be set.
import { crc32, deflateRawSync } from "node:zlib";

export interface Spec {
  name: string;
  data?: Buffer | string;
  /** Unix mode (default regular file 0644, folder 0755 for a name ending in /). */
  mode?: number;
  /** 0 = stored, 8 = deflate (default). */
  method?: 0 | 8;
  flags?: number;
  /** The uncompressed size the directory states (default: the real one). */
  declaredSize?: number;
  declaredCompressed?: number;
  crc?: number;
  /** The name in the local header (default: the same as in the directory). */
  localName?: string;
  /** Madeby host: 3 = Unix (default), 0 = DOS. */
  host?: number;
  /** Place this entry's data at the local header of entry number `shareWith` (overlap). */
  shareWith?: number;
}

export function buildZip(specs: Spec[], options: { zip64?: boolean; comment?: string } = {}): Buffer {
  const parts: Buffer[] = [];
  const central: Buffer[] = [];
  const offsets: number[] = [];
  let offset = 0;
  for (const [index, spec] of specs.entries()) {
    const isDir = spec.name.endsWith("/");
    const data = Buffer.from(spec.data ?? "");
    const method = spec.method ?? (isDir ? 0 : 8);
    const body = method === 8 ? deflateRawSync(data) : data;
    const nameBytes = Buffer.from(spec.name, "utf8");
    const localNameBytes = Buffer.from(spec.localName ?? spec.name, "utf8");
    const crc = spec.crc ?? crc32(data);
    const csize = spec.declaredCompressed ?? body.length;
    const usize = spec.declaredSize ?? data.length;
    let at = offset;
    if (spec.shareWith !== undefined) {
      at = offsets[spec.shareWith] ?? 0;
    } else {
      const local = Buffer.alloc(30);
      local.writeUInt32LE(0x04034b50, 0);
      local.writeUInt16LE(20, 4);
      local.writeUInt16LE(spec.flags ?? 0, 6);
      local.writeUInt16LE(method, 8);
      local.writeUInt32LE(crc, 14);
      local.writeUInt32LE(csize, 18);
      local.writeUInt32LE(usize, 22);
      local.writeUInt16LE(localNameBytes.length, 26);
      parts.push(local, localNameBytes, body);
      offset += 30 + localNameBytes.length + body.length;
    }
    offsets[index] = at;
    const mode = spec.mode ?? (isDir ? 0o040755 : 0o100644);
    const header = Buffer.alloc(46);
    header.writeUInt32LE(0x02014b50, 0);
    header.writeUInt16LE(((spec.host ?? 3) << 8) | 20, 4);
    header.writeUInt16LE(20, 6);
    header.writeUInt16LE(spec.flags ?? 0, 8);
    header.writeUInt16LE(method, 10);
    header.writeUInt32LE(crc, 16);
    header.writeUInt32LE(csize, 20);
    header.writeUInt32LE(usize, 24);
    header.writeUInt16LE(nameBytes.length, 28);
    header.writeUInt32LE(((mode << 16) >>> 0) + (isDir ? 0x10 : 0), 38);
    header.writeUInt32LE(at, 42);
    central.push(header, nameBytes);
  }
  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(options.zip64 ? 0xffff : specs.length, 8);
  end.writeUInt16LE(options.zip64 ? 0xffff : specs.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, directory, end]);
}

/** A good submission: the minimum the explainer needs, in the shape of the real one. */
export function goodSpecs(): Spec[] {
  return [
    { name: "src/" },
    { name: "src/app.yaml", data: "title: Test\nlanguages: [de]\nchapters: [kap]\nscope: { in: [a], out: [b] }\n" },
    { name: "src/kap/" },
    { name: "src/kap/chapter.yaml", data: "title: Kapitel\npages: [seite]\n" },
    { name: "src/kap/seite.yaml", data: "title: Seite\nscope: Text.\n" },
    { name: "src/images/" },
    { name: "src/images/bild-1.png", data: Buffer.from([0x89, 0x50, 0x4e, 0x47]) },
  ];
}
