/**
 * 조립된 Blob을 파일로 저장시킨다 (기술명세서 §3).
 *
 * revoke를 10초 뒤로 미루는 이유: click() 직후 즉시 해제하면 일부 브라우저에서
 * 아직 시작되지 않은 저장이 취소되어 파일이 남지 않는다. 즉시 revoke 금지.
 */
export function saveBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
}
