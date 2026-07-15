"use client";

import { useMemo } from "react";
import type { Faction } from "@/lib/types";

/**
 * 流派克制关系有向图（零依赖 SVG）
 *
 * - 12 节点圆形（radial）排列
 * - 边 A→B：A.counters 含 B，表示 A 克制 B
 * - 选中节点时：出边红、入边橙、其余变暗
 */

interface CounterGraphProps {
  factions: Faction[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** 画布尺寸（viewBox），节点圆心半径与节点半径 */
const VIEW = 640;
const CX = VIEW / 2;
const CY = VIEW / 2;
const ORBIT_R = 238;
const NODE_R = 42;

interface NodePos {
  id: string;
  x: number;
  y: number;
}

type EdgeState = "idle" | "out" | "in" | "dim";
type NodeState = "idle" | "selected" | "neighbor" | "dim";

const EDGE_STYLE: Record<
  EdgeState,
  { stroke: string; opacity: number; width: number; marker: string }
> = {
  idle: { stroke: "#64748b", opacity: 0.4, width: 1.5, marker: "arrow-idle" },
  out: { stroke: "#ef4444", opacity: 1, width: 3, marker: "arrow-out" },
  in: { stroke: "#f97316", opacity: 1, width: 3, marker: "arrow-in" },
  dim: { stroke: "#64748b", opacity: 0.12, width: 1.5, marker: "arrow-dim" },
};

export function CounterGraph({
  factions,
  selectedId,
  onSelect,
}: CounterGraphProps) {
  // 圆形布局：从顶部开始顺时针均匀分布
  const positions = useMemo<NodePos[]>(() => {
    const n = factions.length || 1;
    return factions.map((f, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
      return {
        id: f.id,
        x: CX + ORBIT_R * Math.cos(angle),
        y: CY + ORBIT_R * Math.sin(angle),
      };
    });
  }, [factions]);

  const posMap = useMemo(() => {
    const m = new Map<string, NodePos>();
    for (const p of positions) m.set(p.id, p);
    return m;
  }, [positions]);

  // 有向边：A.counters 含 B → A→B（仅保留两端都存在的边）
  const edges = useMemo(() => {
    const list: { from: string; to: string; key: string }[] = [];
    for (const a of factions) {
      for (const bId of a.counters) {
        if (posMap.has(bId)) {
          list.push({ from: a.id, to: bId, key: `${a.id}->${bId}` });
        }
      }
    }
    return list;
  }, [factions, posMap]);

  // 二次贝塞尔路径：起点终点落在节点边缘，控制点为连线中点向圆心方向偏移
  const pathFor = useMemo(() => {
    return (fromId: string, toId: string): string => {
      const a = posMap.get(fromId);
      const b = posMap.get(toId);
      if (!a || !b) return "";
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      // 起点贴 A 边缘；终点退到 B 边缘外留出箭头空间
      const sx = a.x + ux * NODE_R;
      const sy = a.y + uy * NODE_R;
      const ex = b.x - ux * (NODE_R + 8);
      const ey = b.y - uy * (NODE_R + 8);
      // 中点向圆心偏移，避免线条穿过中心区域造成重叠
      const mx = (sx + ex) / 2;
      const my = (sy + ey) / 2;
      const cdx = CX - mx;
      const cdy = CY - my;
      const cLen = Math.hypot(cdx, cdy) || 1;
      const offset = 60;
      const cpx = mx + (cdx / cLen) * offset;
      const cpy = my + (cdy / cLen) * offset;
      return `M ${sx} ${sy} Q ${cpx} ${cpy} ${ex} ${ey}`;
    };
  }, [posMap]);

  function edgeState(fromId: string, toId: string): EdgeState {
    if (!selectedId) return "idle";
    if (fromId === selectedId) return "out";
    if (toId === selectedId) return "in";
    return "dim";
  }

  function nodeState(id: string): NodeState {
    if (!selectedId) return "idle";
    if (id === selectedId) return "selected";
    // 邻居：选中节点的出边或入边对端
    const sel = factions.find((f) => f.id === selectedId);
    if (sel?.counters.includes(id)) return "neighbor";
    const self = factions.find((f) => f.id === id);
    if (self?.counters.includes(selectedId)) return "neighbor";
    return "dim";
  }

  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      width="100%"
      height="100%"
      role="img"
      aria-label="流派克制关系图谱"
      className="select-none"
    >
      <defs>
        {([
          ["arrow-idle", "#64748b", 0.4],
          ["arrow-out", "#ef4444", 1],
          ["arrow-in", "#f97316", 1],
          ["arrow-dim", "#64748b", 0.12],
        ] as const).map(([id, fill, op]) => (
          <marker
            key={id}
            id={id}
            viewBox="0 0 10 10"
            refX={9}
            refY={5}
            markerWidth={10}
            markerHeight={10}
            markerUnits="userSpaceOnUse"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" fill={fill} fillOpacity={op} />
          </marker>
        ))}
      </defs>

      {/* 装饰：节点轨道虚线圆 */}
      <circle
        cx={CX}
        cy={CY}
        r={ORBIT_R}
        fill="none"
        stroke="#475569"
        strokeOpacity={0.25}
        strokeWidth={1}
        strokeDasharray="3 6"
      />

      {/* 边 */}
      <g>
        {edges.map((e) => {
          const st = edgeState(e.from, e.to);
          const s = EDGE_STYLE[st];
          return (
            <path
              key={e.key}
              d={pathFor(e.from, e.to)}
              fill="none"
              stroke={s.stroke}
              strokeOpacity={s.opacity}
              strokeWidth={s.width}
              strokeLinecap="round"
              markerEnd={`url(#${s.marker})`}
            />
          );
        })}
      </g>

      {/* 节点 */}
      <g>
        {factions.map((f) => {
          const p = posMap.get(f.id);
          if (!p) return null;
          const st = nodeState(f.id);
          const opacity = st === "dim" ? 0.3 : 1;
          const isSelected = st === "selected";
          return (
            <g
              key={f.id}
              transform={`translate(${p.x} ${p.y})`}
              style={{ cursor: "pointer" }}
              opacity={opacity}
              onClick={() => onSelect(f.id)}
            >
              <title>{f.name}</title>
              <circle
                r={NODE_R}
                fill={f.color ?? "#888888"}
                fillOpacity={isSelected ? 1 : 0.85}
                stroke={isSelected ? "#ffffff" : "rgba(0,0,0,0.3)"}
                strokeWidth={isSelected ? 3 : 1}
              />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                fontWeight={600}
                fill="#ffffff"
                stroke="rgba(0,0,0,0.5)"
                strokeWidth={3}
                paintOrder="stroke"
                style={{ pointerEvents: "none" }}
              >
                {f.name}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
