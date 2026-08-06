'use client';

import { useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import { PRIVACY_TITLE, PRIVACY_INTRO, PRIVACY_SECTIONS, type PrivacyBlock } from '@/data/privacy';

/**
 * 개인정보처리방침 모달 (Footer '개인정보처리방침' 링크 → 부정훈련 예방 안내와 동일한 모달 경험)
 *
 * 문구는 data/privacy.ts 단일 소스에서만 오며, 이 컴포넌트는 순회 렌더만 담당한다.
 * 아래 파싱(필수/선택 태그·【 】 하이라이트)은 전부 렌더링 시점의 시각적 표현일 뿐이며
 * 원본 문자열을 변형하지 않는다 — 매치 실패 시 원문을 그대로 출력하는 폴백이 필수다.
 *
 * 확장은 전부 .priv-* 신규 클래스이거나 .priv-doc 스코프 하위 선택자로만 한다.
 * ReportModal(예방/신고/조회)·ISMS 모달과 공유하는 .pv-* 선언은 건드리지 않는다.
 */

/** 「…」 형태의 미확정 표기를 하이라이트. 매치가 없으면 원문 그대로 반환된다. */
function renderBrackets(text: string) {
  const parts = text.split(/(【[^】]*】)/g);
  return parts.map((p, i) =>
    /^【[^】]*】$/.test(p) ? <mark key={i} className="priv-bracket">{p}</mark> : p
  );
}

const REQ_OPT_RE = /^\(필수\)\s*([^]*?)(?:\s*\(선택\)\s*([^]*))?$/;

/** '수집 항목' 셀의 (필수)/(선택)을 태그+목록으로 분리 렌더. 패턴 불일치 시 원문 그대로. */
function renderCollectionCell(text: string) {
  const m = text.match(REQ_OPT_RE);
  if (!m) return <>{renderBrackets(text)}</>; // 폴백 — 문자 손실 0 보장
  const [, req, opt] = m;
  return (
    <div className="priv-items">
      <div className="priv-item">
        <span className="priv-tag req">필수</span>
        <span>{renderBrackets(req.trim())}</span>
      </div>
      {opt && (
        <div className="priv-item">
          <span className="priv-tag opt">선택</span>
          <span>{renderBrackets(opt.trim())}</span>
        </div>
      )}
    </div>
  );
}

function Block({ b }: { b: PrivacyBlock }) {
  if (b.type === 'note') return <p className="pv-note">{renderBrackets(b.text ?? '')}</p>;
  if (b.type === 'list')
    return <ul className="pv-list">{b.items?.map((it) => <li key={it}>{renderBrackets(it)}</li>)}</ul>;
  if (b.type === 'table') {
    // 3열 이상은 데스크톱에서 컬럼 폭을 재분배하고 ≤640px에서 카드형으로 전환한다(가로 스크롤 불필요).
    const wide = (b.columns?.length ?? 0) >= 3;
    return (
      <div style={{ overflowX: wide ? undefined : 'auto' }}>
        <table className={`pv-table${wide ? ' priv-table--wide' : ''}`}>
          <thead><tr>{b.columns?.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {b.rows?.map((r, i) => (
              <tr key={i}>
                {r.map((cell, j) => (
                  <td key={j} data-label={b.columns?.[j]}>
                    {j === 2 && wide ? renderCollectionCell(cell) : renderBrackets(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return <p>{renderBrackets(b.text ?? '')}</p>;
}

export default function PrivacyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<() => void>();
  const [active, setActive] = useState(PRIVACY_SECTIONS[0].id);
  const [scrolled, setScrolled] = useState(false);

  /** sticky 목차 바가 가리는 높이 — 이만큼 더 내려야 점프한 조항의 제목이 바 아래로 드러난다. */
  const stickyOffset = () => {
    const toc = rootRef.current?.querySelector('.priv-toc') as HTMLElement | null;
    return (toc?.offsetHeight ?? 0) + 8;
  };

  // 열릴 때 본문 스크롤 최상단 초기화 (ReportModal의 bodyRef.scrollTop = 0 패턴).
  // 공통 Modal은 무변경 대상이라 스크롤 컨테이너(.pv-body)를 자식에서 찾아 초기화한다.
  useEffect(() => {
    if (!open) return;
    const body = rootRef.current?.closest('.pv-body');
    if (body) body.scrollTop = 0;
  }, [open]);

  // 스크롤스파이(목차 활성 조항) + 스크롤-투-톱 FAB 노출 임계값
  useEffect(() => {
    if (!open) return;
    const body = rootRef.current?.closest('.pv-body') as HTMLElement | null;
    if (!body) return;
    setActive(PRIVACY_SECTIONS[0].id);
    setScrolled(false);

    /**
     * 문서 끝 여백을 실측해 채운다.
     * 이게 없으면 마지막 조항들이 스크롤 최대치에 걸려 화면 상단까지 올라오지 못하고,
     * 그 결과 제9·10조 칩은 눌러도 활성화되지 않아 고장난 것처럼 보인다.
     * 필요한 만큼만(= 뷰포트 높이 - 꼬리 높이) 주므로 과잉 여백이 생기지 않는다.
     */
    const fit = () => {
      const sp = spacerRef.current;
      const last = document.getElementById(PRIVACY_SECTIONS[PRIVACY_SECTIONS.length - 1].id);
      if (!sp || !last) return;
      const cur = sp.offsetHeight;
      const lastTop = last.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop;
      const tail = body.scrollHeight - cur - lastTop;   // 스페이서를 뺀 꼬리 높이
      // 최대 스크롤이 '마지막 조항 제목이 목차 바 바로 아래' 지점과 맞아떨어지는 최소값.
      // (더 주면 문서 끝이 필요 이상으로 비고, 덜 주면 마지막 조항이 상단에 닿지 못한다)
      const need = Math.max(0, body.clientHeight - tail - stickyOffset() + 4);
      if (Math.abs(need - cur) > 2) sp.style.height = `${need}px`;
    };
    fitRef.current = fit;
    // 폰트 로드 등으로 레이아웃이 나중에 바뀌면 한 번 잰 값은 모자라게 된다.
    // ResizeObserver로 변화를 계속 따라가되, 위의 2px 가드가 스스로 수렴시켜 루프를 막는다.
    fit();
    const raf = requestAnimationFrame(fit);
    const timer = setTimeout(fit, 250);   // 폰트 스왑 직후 한 번 더 확정
    const ro = new ResizeObserver(() => fit());
    ro.observe(rootRef.current!);
    window.addEventListener('resize', fit);

    const onScroll = () => setScrolled(body.scrollTop > 320);
    body.addEventListener('scroll', onScroll, { passive: true });

    // 콜백은 '상태가 바뀐 대상'만 전달하므로 배치만 보고 판정하면 화면 위쪽 조항을 놓친다.
    // → 전체 교차 상태를 누적하고 문서 순서상 첫 교차 조항(=최상단)을 활성으로 삼는다.
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
        const first = PRIVACY_SECTIONS.find((s) => seen.get(s.id));
        if (first) setActive(first.id);
      },
      { root: body, rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    );
    PRIVACY_SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener('resize', fit);
      body.removeEventListener('scroll', onScroll);
      io.disconnect();
    };
  }, [open]);

  const jump = (id: string) => {
    const body = rootRef.current?.closest('.pv-body') as HTMLElement | null;
    const el = document.getElementById(id);
    if (!body || !el) return;
    // 이동 직전 꼬리 여백을 재확정한다 — 폰트 로드 등으로 레이아웃이 늦게 바뀌어도
    // 마지막 조항이 상단에 닿지 못하는 일이 없도록(ResizeObserver 알림에 의존하지 않음).
    fitRef.current?.();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // offsetTop은 offsetParent(.pv-overlay) 기준이라 스크롤 컨테이너(.pv-body)와 원점이 122px 어긋난다.
    // 화면 좌표 차이로 계산해야 대상 조항이 정확히 상단에 걸린다.
    const delta = el.getBoundingClientRect().top - body.getBoundingClientRect().top;
    body.scrollTo({ top: body.scrollTop + delta - stickyOffset(), behavior: reduce ? 'auto' : 'smooth' });
  };

  // 활성 칩이 목차 바 밖으로 밀려 잘리지 않도록 가로 스크롤을 맞춘다(모바일에서 특히 필요).
  useEffect(() => {
    const toc = rootRef.current?.querySelector('.priv-toc') as HTMLElement | null;
    const chip = toc?.querySelector('.priv-toc-chip.on') as HTMLElement | null;
    if (!toc || !chip) return;
    const left = chip.offsetLeft;
    const right = left + chip.offsetWidth;
    if (left < toc.scrollLeft) toc.scrollLeft = left - 12;
    else if (right > toc.scrollLeft + toc.clientWidth) toc.scrollLeft = right - toc.clientWidth + 12;
  }, [active]);

  return (
    <Modal open={open} onClose={onClose} labelledBy="privacy-modal-title" title={PRIVACY_TITLE} maxWidth={720}>
      <div ref={rootRef} className="priv-doc">
        {/* 목차 — 숫자만으로는 어떤 조인지 인지하기 어려워 전 버튼에 '제N조' 라벨을 노출한다 */}
        <div className="priv-toc" role="group" aria-label="조항 목차">
          {PRIVACY_SECTIONS.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              className={`priv-toc-chip${active === s.id ? ' on' : ''}`}
              aria-label={s.title}
              aria-current={active === s.id ? 'true' : undefined}
              onClick={() => jump(s.id)}
            >
              제{idx + 1}조
            </button>
          ))}
        </div>

        <p className="pv-lead">{renderBrackets(PRIVACY_INTRO)}</p>
        {PRIVACY_SECTIONS.map((s, idx) => (
          <section key={s.id} id={s.id} className={idx > 0 ? 'priv-article' : undefined}>
            <h4 className="pv-h">
              <span className="priv-num">{String(idx + 1).padStart(2, '0')}</span>
              {s.title}
            </h4>
            {s.blocks.map((b, i) => <Block key={i} b={b} />)}
          </section>
        ))}

        {/* 마지막 조항도 화면 상단까지 올라올 수 있도록 실측해 채우는 여백(높이는 JS가 지정) */}
        <div ref={spacerRef} className="priv-tail" aria-hidden="true" />

        {/* FAB는 마지막 자식 — 첫 자식이면 흐름 공간을 차지해 목차가 38px 밀려난다 */}
        <button
          type="button"
          className={`priv-totop${scrolled ? ' show' : ''}`}
          aria-label="문서 맨 위로"
          tabIndex={scrolled ? 0 : -1}
          onClick={() => jump(PRIVACY_SECTIONS[0].id)}
        >
          ↑
        </button>
      </div>
    </Modal>
  );
}
