export type ProgressFn = (received: number, total: number) => void;

export const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * 파일을 스트리밍으로 받아 Blob으로 조립한다 (기술명세서 §3).
 *
 * <a download>는 저장 완료 시점을 알려주지 않는다. 전송 완료를 직접 감지하려고
 * ReadableStream으로 청크를 세며 받는다 — 이 함수가 반환되면 전송은 끝난 것이다.
 * reader가 없는 환경(스트림 미지원)은 res.blob()으로 일괄 수신하고 진행률만 포기한다.
 */
export async function fetchFileWithProgress(
  url: string,
  signal: AbortSignal,
  onProgress: ProgressFn,
): Promise<Blob> {
  const res = await fetch(url, { signal, cache: 'default' });
  if (!res.ok) throw Object.assign(new Error('HTTP_ERROR'), { status: res.status });

  const total = Number(res.headers.get('Content-Length')) || 0;
  const reader = res.body?.getReader();

  // 스트림 미지원 → 일괄 수신 (진행률 없음)
  if (!reader) return await res.blob();

  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress(received, total);
  }
  return new Blob(chunks as BlobPart[], { type: XLSX_MIME });
}
