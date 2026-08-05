import { AlertCircle } from 'lucide-react';
import { KIUM_CONTENT } from '@/lib/kium/content';

/**
 * KiumCautions (신설) — 기술명세서 최종 v2.0 §4 · 부록 B 원문 고정
 * 신청절차 하단 유의사항 3종. surface 박스 + lucide alert-circle + ul 시맨틱.
 */
export default function KiumCautions() {
  return (
    <div className="kium-cautions">
      <p className="kium-cautions-h">
        <AlertCircle size={16} aria-hidden="true" />
        유의사항
      </p>
      <ul>
        {KIUM_CONTENT.cautions.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </div>
  );
}
