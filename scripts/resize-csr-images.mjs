/**
 * 사회공헌(/csr) 대용량 이미지 리사이즈 — 1회성 실행 기록용 스크립트
 *
 * 배경: 수집 원본 그대로 배치된 public/img/ 자산 중 7개가 1MB를 초과해
 * 상세 페이지 로딩에 부담이 됐다. 최종 명세 v2.0 §6의 "커밋 전 용량 고지"에
 * 대한 담당자 결정(2026-08-03, 임지홍)에 따라 리사이즈 후 커밋한다.
 *
 * 방침
 *  - 최대 폭 1600px (그보다 작은 원본은 확대하지 않는다 — withoutEnlargement)
 *  - JPEG 품질 80, 비율 유지
 *  - 파일명·확장자 불변 (lib/csr/data.ts의 src 참조 경로가 바뀌면 안 된다)
 *
 * 실행: node scripts/resize-csr-images.mjs
 * 재실행해도 안전하다(이미 1600px 이하면 축소 없이 재인코딩만 일어난다).
 */
import sharp from 'sharp';
import { readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const IMG_DIR = path.join(process.cwd(), 'public', 'img');
const MAX_WIDTH = 1600;
const QUALITY = 80;

// 대상은 1MB 초과 7개로 고정한다(전수 재인코딩은 불필요한 화질 손실을 낳는다)
const TARGETS = [
  'csr-019-01.jpg',
  'csr-026-01.jpg',
  'csr-028-01.jpg',
  'csr-030-01.jpg',
  'csr-031-01.jpg',
  'csr-033-01.jpg',
  'csr-036-01.jpg',
];

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2);

for (const name of TARGETS) {
  const file = path.join(IMG_DIR, name);
  const before = (await stat(file)).size;

  // 입력 파일을 그대로 덮어쓰므로 버퍼로 먼저 읽는다(sharp가 스트리밍 중 같은 파일에 쓰면 깨진다)
  const input = await readFile(file);
  const meta = await sharp(input).metadata();

  const output = await sharp(input)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY })
    .toBuffer();

  await writeFile(file, output);
  const after = (await stat(file)).size;
  const out = await sharp(output).metadata();

  console.log(
    `${name}  ${meta.width}x${meta.height} ${mb(before)}MB  ->  ` +
      `${out.width}x${out.height} ${mb(after)}MB`
  );
}
