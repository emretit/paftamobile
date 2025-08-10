import React, { useCallback, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ZoomIn, ZoomOut, Maximize, Grid, Magnet } from "lucide-react";
import { ProposalTemplate } from "@/types/proposal-template";
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Node,
  type Edge,
  type OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import FieldNode from "./FieldNode";

interface TemplateCanvasProps {
  template: ProposalTemplate;
}

type GuideLine =
  | { type: "v"; x: number; y1: number; y2: number }
  | { type: "h"; y: number; x1: number; x2: number };

const ZOOM_LEVELS = [50, 75, 100, 125, 150];
const DEFAULT_GRID_SIZE = 10;
const SNAP_THRESHOLD = 6; // px

const nodeTypes = { fieldNode: FieldNode };

export const TemplateCanvas: React.FC<TemplateCanvasProps> = ({ template }) => {
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [smartGuides, setSmartGuides] = useState(true);
  const [gridSize, setGridSize] = useState<number>(DEFAULT_GRID_SIZE);

  // A4 @ 96DPI
  const pageWidth = 794;
  const pageHeight = 1123;
  const scaledWidth = (pageWidth * zoom) / 100;
  const scaledHeight = (pageHeight * zoom) / 100;

  const margins = template.designSettings?.margins ?? {
    top: 40,
    bottom: 40,
    left: 40,
    right: 40,
  };

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, , onEdgesChange] = useEdgesState<Edge>([]);
  const rf = useReactFlow<Node, Edge>();
  const screenToFlowPosition = rf.screenToFlowPosition;

  const [guides, setGuides] = useState<GuideLine[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex < ZOOM_LEVELS.length - 1) setZoom(ZOOM_LEVELS[currentIndex + 1]);
  };
  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex > 0) setZoom(ZOOM_LEVELS[currentIndex - 1]);
  };
  const handleFitToScreen = () => setZoom(75);

  // HTML5 drag & drop from FieldPalette → create node
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current) return;

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = screenToFlowPosition({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });

      const id = crypto.randomUUID();
      const newNode: Node = {
        id,
        type: "fieldNode",
        position,
        data: {
          fieldType: type,
          label: `${type.toUpperCase()} Alanı`,
          required: false,
          style: {
            width: "200px",
            alignment: "left",
            fontSize: 14,
            fontWeight: "normal",
          },
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition]
  );

  const getNodeRects = useCallback(() => {
    return nodes.map((n) => {
      const d = (n.data || {}) as any;
      const rawWidth = typeof d?.style?.width === "string" ? parseInt(d.style.width) : 200;
      const w = rawWidth || 200;
      return {
        id: n.id,
        x: n.position.x,
        y: n.position.y,
        w,
        h: 48,
        cx: n.position.x + w / 2,
        cy: n.position.y + 24,
      };
    });
  }, [nodes]);

  const pageRects = useMemo(() => {
    // page inner area (content area considering margins)
    const left = margins.left;
    const right = pageWidth - margins.right;
    const top = margins.top;
    const bottom = pageHeight - margins.bottom;
    const hCenter = pageWidth / 2;
    const vCenter = pageHeight / 2;
    return { left, right, top, bottom, hCenter, vCenter };
  }, [margins, pageWidth, pageHeight]);

  const computeSmartSnap = useCallback(
    (nodeId: string, x: number, y: number) => {
      const rects = getNodeRects();
      const me = rects.find((r) => r.id === nodeId);
      if (!me) return { x, y, guides: [] as GuideLine[] };

      const candidatesV: number[] = [pageRects.left, pageRects.right, pageRects.hCenter];
      const candidatesH: number[] = [pageRects.top, pageRects.bottom, pageRects.vCenter];

      rects.forEach((r) => {
        if (r.id === nodeId) return;
        candidatesV.push(r.x, r.x + r.w, r.cx);
        candidatesH.push(r.y, r.y + r.h, r.cy);
      });

      let snappedX = x;
      let snappedY = y;
      const g: GuideLine[] = [];

      // snap left edge
      for (const vx of candidatesV) {
        if (Math.abs(snappedX - vx) <= SNAP_THRESHOLD) {
          snappedX = vx;
          g.push({ type: "v", x: vx, y1: 0, y2: pageHeight });
          break;
        }
      }
      // snap horizontal (top)
      for (const hy of candidatesH) {
        if (Math.abs(snappedY - hy) <= SNAP_THRESHOLD) {
          snappedY = hy;
          g.push({ type: "h", y: hy, x1: 0, x2: pageWidth });
          break;
        }
      }

      // center snapping (approximate) – align centers
      const myWidth = me.w;
      const myHeight = me.h;
      const myCenterX = snappedX + myWidth / 2;
      const myCenterY = snappedY + myHeight / 2;

      for (const vx of candidatesV) {
        if (Math.abs(myCenterX - vx) <= SNAP_THRESHOLD) {
          snappedX = vx - myWidth / 2;
          g.push({ type: "v", x: vx, y1: 0, y2: pageHeight });
          break;
        }
      }
      for (const hy of candidatesH) {
        if (Math.abs(myCenterY - hy) <= SNAP_THRESHOLD) {
          snappedY = hy - myHeight / 2;
          g.push({ type: "h", y: hy, x1: 0, x2: pageWidth });
          break;
        }
      }

      return { x: snappedX, y: snappedY, guides: g };
    },
    [getNodeRects, pageHeight, pageWidth]
  );

  const onNodeDragStart = useCallback((_, node: Node) => {
    setDraggingId(node.id);
  }, []);

  const onNodeDrag = useCallback(
    (_: any, node: Node) => {
      if (!smartGuides) return;
      const { x, y, guides } = computeSmartSnap(node.id, node.position.x, node.position.y);
      // Sadece kılavuzları canlı göster; nihai snap bırakışta uygulansın
      setGuides(guides);
    },
    [smartGuides, computeSmartSnap]
  );

  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      setDraggingId(null);
      setGuides([]);

      if (!smartGuides && !snapToGrid) return;

      let nextX = node.position.x;
      let nextY = node.position.y;

      if (smartGuides) {
        const res = computeSmartSnap(node.id, nextX, nextY);
        nextX = res.x;
        nextY = res.y;
      }
      if (snapToGrid && gridSize > 0) {
        nextX = Math.round(nextX / gridSize) * gridSize;
        nextY = Math.round(nextY / gridSize) * gridSize;
      }

      const id = node.id;
      setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, position: { x: nextX, y: nextY } } : n)));
    },
    [smartGuides, snapToGrid, gridSize, computeSmartSnap, setNodes]
  );

  const onConnect: OnConnect = useCallback(() => {
    // connecting is disabled in this canvas
    return undefined as any;
  }, []);

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-card border-b">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= ZOOM_LEVELS[0]}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
          <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleFitToScreen}>
            <Maximize className="w-4 h-4 mr-1" />
            Sığdır
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant={showGrid ? "default" : "outline"} size="sm" onClick={() => setShowGrid(!showGrid)}>
            <Grid className="w-4 h-4 mr-1" />
            Izgara
          </Button>
          <Button variant={snapToGrid ? "default" : "outline"} size="sm" onClick={() => setSnapToGrid((v) => !v)}>
            <Magnet className="w-4 h-4 mr-1" />
            Grid Snap
          </Button>
          <Button variant={smartGuides ? "default" : "outline"} size="sm" onClick={() => setSmartGuides((v) => !v)}>
            <Magnet className="w-4 h-4 mr-1" />
            Akıllı Kılavuz
          </Button>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs text-muted-foreground">Grid:</span>
            <Input
              type="number"
              className="h-8 w-16"
              min={2}
              max={64}
              value={gridSize}
              onChange={(e) => setGridSize(Math.max(2, Math.min(64, Number(e.target.value) || DEFAULT_GRID_SIZE)))}
            />
            <span className="text-xs text-muted-foreground">px</span>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto p-8">
        <div className="flex justify-center">
          <Card
            className="relative shadow-xl bg-white overflow-hidden"
            style={{ width: scaledWidth, height: scaledHeight, minHeight: scaledHeight }}
          >
            {/* Page */}
            <div
              className="relative"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left", width: pageWidth, height: pageHeight }}
            >
              {/* Margin guides */}
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className="absolute border border-dashed"
                  style={{
                    left: margins.left,
                    right: margins.right,
                    top: margins.top,
                    bottom: margins.bottom,
                    borderColor: "#e5e7eb",
                  }}
                />
              </div>

              {/* ReactFlow canvas */}
              <div ref={reactFlowWrapper} className="absolute inset-0">
                <ReactFlowProvider>
                  <ReactFlow
                    nodeTypes={nodeTypes}
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    panOnDrag
                    selectionOnDrag
                    nodesDraggable
                    nodesConnectable={false}
                    zoomOnScroll={false}
                    zoomOnPinch={false}
                    zoomOnDoubleClick={false}
                    snapToGrid={snapToGrid}
                    snapGrid={[gridSize, gridSize]}
                    fitView={false}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeDragStart={onNodeDragStart}
                    onNodeDrag={onNodeDrag}
                    onNodeDragStop={onNodeDragStop}
                  >
                    {showGrid && <Background gap={gridSize} size={1} color="#e5e7eb" />}
                    <Controls showInteractive={false} position="bottom-right" />
                    {/* Smart guide lines */}
                    {smartGuides && guides.map((g, i) => (
                      g.type === "v" ? (
                        <div
                          key={`gv-${i}`}
                          className="absolute bg-blue-500/60"
                          style={{ left: g.x, top: g.y1, width: 1, height: g.y2 - g.y1 }}
                        />
                      ) : (
                        <div
                          key={`gh-${i}`}
                          className="absolute bg-blue-500/60"
                          style={{ top: g.y, left: g.x1, height: 1, width: g.x2 - g.x1 }}
                        />
                      )
                    ))}
                  </ReactFlow>
                </ReactFlowProvider>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Status Bar */}
      <div className="p-4 bg-card border-t text-sm text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>A4 Sayfa • Dikey • {scaledWidth}×{scaledHeight}px ({zoom}%)</span>
          <span>{nodes.length} öğe</span>
        </div>
      </div>
    </div>
  );
};