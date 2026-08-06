'use client';

import { useEffect, useRef } from 'react';
import Modal from './Modal';
import { PRIVACY_TITLE, PRIVACY_INTRO, PRIVACY_SECTIONS, type PrivacyBlock } from '@/data/privacy';

/**
 * 개인정보처리방침 모달 (Footer '개인정보처리방침' 링크 → 부정훈련 예방 안내와 동일한 모달 경험)
 *
 * 문구는 data/privacy.ts 단일 소스에서만 오며, 이 컴포넌트는 순회 렌더만 담당한다.
 * 신규 스타일을 만들지 않고 예방 안내 pane의 기존 클래스(pv-lead·pv-h·pv-table·pv-list·pv-note)를
 * 그대로 재사용한다. 표는 좁은 화면에서만 래퍼의 overflow-x로 흘린다.
 */

function Block({ b }: { b: PrivacyBlock }) {
  if (b.type === 'note') return <p className="pv-note">{b.text}</p>;
  if (b.type === 'list')
    return <ul className="pv-list">{b.items?.map((it) => <li key={it}>{it}</li>)}</ul>;
  if (b.type === 'table')
    // 3열 이상 표는 좁은 화면에서 열 폭이 글자 단위로 무너지므로 최소 폭을 주고 래퍼가 가로로 흘린다.
    // (신규 클래스 없이 인라인만 사용 — 최소 폭이 없으면 width:100%로 압축돼 overflow-x가 동작하지 않는다)
    return (
      <div style={{ overflowX: 'auto' }}>
        <table className="pv-table" style={(b.columns?.length ?? 0) >= 3 ? { minWidth: 560 } : undefined}>
          <thead><tr>{b.columns?.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {b.rows?.map((r, i) => <tr key={i}>{r.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
    );
  return <p>{b.text}</p>;
}

export default function PrivacyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);

  // 열릴 때 본문 스크롤 최상단 초기화 (ReportModal의 bodyRef.scrollTop = 0 패턴).
  // 공통 Modal은 무변경 대상이라 스크롤 컨테이너(.pv-body)를 자식에서 찾아 초기화한다.
  useEffect(() => {
    if (!open) return;
    const body = rootRef.current?.closest('.pv-body');
    if (body) body.scrollTop = 0;
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} labelledBy="privacy-modal-title" title={PRIVACY_TITLE} maxWidth={720}>
      <div ref={rootRef}>
        <p className="pv-lead">{PRIVACY_INTRO}</p>
        {PRIVACY_SECTIONS.map((s) => (
          <section key={s.id}>
            <h4 className="pv-h">{s.title}</h4>
            {s.blocks.map((b, i) => <Block key={i} b={b} />)}
          </section>
        ))}
      </div>
    </Modal>
  );
}
