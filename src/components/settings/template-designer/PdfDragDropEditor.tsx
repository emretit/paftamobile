import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Background,
  Controls,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TemplateField } from '@/types/proposal-template';
import FieldPalette from './FieldPalette';
import FieldNode from './FieldNode';

interface PdfDragDropEditorProps {
  onSave: (fields: TemplateField[]) => void;
  initialFields?: TemplateField[];
}

const nodeTypes: NodeTypes = {
  fieldNode: FieldNode,
};

const PdfDragDropEditor: React.FC<PdfDragDropEditorProps> = ({ 
  onSave, 
  initialFields = [] 
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    
    const fieldType = event.dataTransfer.getData('application/reactflow');
    if (!fieldType) return;

    const reactFlowBounds = event.currentTarget.getBoundingClientRect();
    const position = {
      x: event.clientX - reactFlowBounds.left - 100,
      y: event.clientY - reactFlowBounds.top - 25,
    };

    const newNode: Node = {
      id: `${fieldType}-${Date.now()}`,
      type: 'fieldNode',
      position,
      data: {
        fieldType,
        label: getFieldLabel(fieldType),
        required: false,
        style: {
          width: '200px',
          alignment: 'left' as const,
          fontSize: 14,
          fontWeight: 'normal' as const,
        }
      },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const getFieldLabel = (fieldType: string): string => {
    const labels: Record<string, string> = {
      text: 'Metin Alanı',
      number: 'Sayı Alanı',
      date: 'Tarih Alanı',
      select: 'Seçim Listesi',
      textarea: 'Uzun Metin',
      checkbox: 'Onay Kutusu',
      image: 'Resim',
      table: 'Tablo',
    };
    return labels[fieldType] || fieldType;
  };

  const handleSave = () => {
    const fields: TemplateField[] = nodes.map((node) => ({
      id: node.id,
      type: node.data.fieldType,
      label: node.data.label,
      key: node.data.label.toLowerCase().replace(/\s+/g, '_'),
      required: node.data.required,
      style: {
        ...node.data.style,
        position: {
          x: node.position.x,
          y: node.position.y,
        }
      }
    }));
    
    onSave(fields);
  };

  return (
    <div className="flex h-[800px] gap-4">
      {/* Field Palette */}
      <div className="w-64 flex-shrink-0">
        <FieldPalette />
      </div>

      {/* PDF Editor Canvas */}
      <div className="flex-1">
        <Card className="h-full p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">PDF Düzenleyici</h3>
            <Button onClick={handleSave}>Alanları Kaydet</Button>
          </div>
          
          <div 
            className="h-[calc(100%-60px)] border-2 border-dashed border-gray-300 rounded-lg relative"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3e%3cdefs%3e%3cpattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse"%3e%3cpath d="M 10 0 L 0 0 0 10" fill="none" stroke="%23e5e5e5" stroke-width="1"/%3e%3c/pattern%3e%3cpattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse"%3e%3crect width="100" height="100" fill="url(%23smallGrid)"/%3e%3cpath d="M 100 0 L 0 0 0 100" fill="none" stroke="%23e5e5e5" stroke-width="2"/%3e%3c/pattern%3e%3c/defs%3e%3crect width="100%" height="100%" fill="url(%23grid)"/%3e%3c/svg%3e")',
              backgroundColor: '#ffffff'
            }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              style={{ backgroundColor: 'transparent' }}
            >
              <Background />
              <Controls />
            </ReactFlow>
            
            {/* PDF Preview Overlay */}
            <div className="absolute inset-4 pointer-events-none border border-gray-400 bg-white/90 rounded shadow-lg">
              <div className="p-6">
                <div className="text-center text-gray-500 text-sm">
                  A4 Sayfa Önizlemesi
                  <br />
                  Alanları buraya sürükleyip bırakın
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PdfDragDropEditor;