import { DOWNLOAD, downloadFileName } from '@/data/content';

/**
 * 과정 리스트 다운로드 설정 (기술명세서 §8).
 *
 * FILE_URL·FILE_NAME은 값을 새로 적지 않고 data/content.ts에서 가져온다.
 * 저장 파일명은 기준월을 싣고 나가는 DF-021-B 규칙(downloadFileName)을 그대로 따르므로,
 * 기준월 교체 시 DOWNLOAD.basisMonth 한 곳만 고치면 여기까지 따라온다.
 */
export const DOWNLOAD_CONFIG = {
  FILE_URL: DOWNLOAD.fileHref,
  FILE_NAME: downloadFileName,
  FILE_SIZE_LABEL: '약 16MB',
  AUTO_CLOSE_MS: 1200,
  AUTO_CLOSE_MS_DIRECT: 2500,
  PREPARING_DELAY_MS: 300,
  PROGRESS_THROTTLE_MS: 100,
  MAX_RETRY: 3,
} as const;
