import Image from 'next/image';
import type { CsrBodyBlock } from '@/lib/csr/types';

type ImageBlock = Extract<CsrBodyBlock, { type: 'image' }>;
type Group =
  | { kind: 'paragraph'; text: string }
  | { kind: 'images'; blocks: ImageBlock[] };

/** 연속된 image 블록을 하나의 그룹으로 묶는다(2개 이상이면 2열 그리드). */
function group(blocks: CsrBodyBlock[]): Group[] {
  const out: Group[] = [];
  for (const b of blocks) {
    if (b.type === 'paragraph') {
      out.push({ kind: 'paragraph', text: b.text });
      continue;
    }
    const last = out[out.length - 1];
    if (last && last.kind === 'images') last.blocks.push(b);
    else out.push({ kind: 'images', blocks: [b] });
  }
  return out;
}

function Figure({ block }: { block: ImageBlock }) {
  return (
    <figure>
      {/* 이미지는 public/csr/{postId}/ 로 리호스팅한 로컬 경로만 사용(핫링킹 금지) */}
      <Image src={block.src} alt={block.alt} width={1200} height={800} sizes="(max-width:820px) 100vw, 820px" />
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
        if (g.blocks.length >= 2) {
          return (
            <div className="csr-figs" key={i}>
              {g.blocks.map((b, j) => <Figure block={b} key={j} />)}
            </div>
          );
        }
        return <Figure block={g.blocks[0]} key={i} />;
      })}
    </div>
  );
}
