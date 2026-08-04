import Image from 'next/image';
import type { CsrBodyBlock } from '@/lib/csr/types';

type ImageBlock = Extract<CsrBodyBlock, { type: 'image' }>;
type Group =
  | { kind: 'paragraph'; text: string }
  | { kind: 'lead'; texts: string[] }
  | { kind: 'images'; blocks: ImageBlock[] };

/** 원문 요약 줄의 표기 규칙 — 문단이 '- '로 시작하면 개요 성격의 줄이다. */
const isLeadLine = (text: string) => text.startsWith('- ');

/**
 * 연속된 image 블록을 하나의 그룹으로 묶고(2개 이상이면 2열 그리드),
 * 본문 첫머리의 '- ' 문단 구간을 리드 블록으로 분리한다.
 *
 * 리드 판정은 **문단 순서** 기준이다. 첫 비'- ' 문단이 나오는 순간 구간이 끝나므로
 * 본문 중간에 나오는 '- ' 문단은 리드로 취급하지 않는다. 앞에 이미지가 먼저 오는
 * 글(리드가 두 번째 블록부터 시작)도 동일하게 잡힌다.
 * data.ts는 손대지 않고 렌더링에서만 분기한다(텍스트는 원문 그대로 출력).
 */
function group(blocks: CsrBodyBlock[]): Group[] {
  let leadCount = 0;
  for (const b of blocks) {
    if (b.type !== 'paragraph') continue;
    if (!isLeadLine(b.text)) break;
    leadCount++;
  }

  const out: Group[] = [];
  let pIndex = 0;
  for (const b of blocks) {
    if (b.type === 'paragraph') {
      const inLead = pIndex < leadCount;
      pIndex++;
      const last = out[out.length - 1];
      if (!inLead) {
        out.push({ kind: 'paragraph', text: b.text });
      } else if (last && last.kind === 'lead') {
        last.texts.push(b.text);
      } else {
        out.push({ kind: 'lead', texts: [b.text] });
      }
      continue;
    }
    const last = out[out.length - 1];
    if (last && last.kind === 'images') last.blocks.push(b);
    else out.push({ kind: 'images', blocks: [b] });
  }
  return out;
}

/* 통일 콘텐츠 폭(래퍼 --maxw 1200px - 거터 48px = 1152px)에 맞춘 sizes.
   2열 그리드는 한 칸이 절반이라 따로 선언한다(560px 이하 1열은 styles/csr.css와 동일 분기). */
const SIZES_SINGLE = '(max-width:1200px) 100vw, 1152px';
const SIZES_GRID = '(max-width:560px) 100vw, (max-width:1200px) 50vw, 569px';

function Figure({ block, sizes }: { block: ImageBlock; sizes: string }) {
  return (
    <figure>
      {/* 이미지는 public/img/ 로 리호스팅한 로컬 경로만 사용(핫링킹 금지) */}
      <Image src={block.src} alt={block.alt} width={1200} height={800} sizes={sizes} />
      {block.caption && <figcaption>{block.caption}</figcaption>}
    </figure>
  );
}

/**
 * 상세 본문 렌더 — 기술명세서 §4-5
 * 구조화된 블록만 렌더한다. dangerouslySetInnerHTML 미사용.
 */
export default function CsrBody({ blocks }: { blocks: CsrBodyBlock[] }) {
  return (
    <div className="csr-body">
      {group(blocks).map((g, i) => {
        if (g.kind === 'paragraph') return <p key={i}>{g.text}</p>;
        if (g.kind === 'lead') {
          return (
            <div className="csr-lead" key={i}>
              {g.texts.map((t, j) => <p key={j}>{t}</p>)}
            </div>
          );
        }
        if (g.blocks.length >= 2) {
          return (
            <div className="csr-figs" key={i}>
              {g.blocks.map((b, j) => <Figure block={b} sizes={SIZES_GRID} key={j} />)}
            </div>
          );
        }
        return <Figure block={g.blocks[0]} sizes={SIZES_SINGLE} key={i} />;
      })}
    </div>
  );
}
