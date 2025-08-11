import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PREDEFINED_ELEMENTS } from '@/data/predefinedElements';
import { PredefinedElement } from '@/types/template-builder';

interface ElementPaletteProps {
  onElementDragStart: (element: PredefinedElement) => void;
}

export const ElementPalette: React.FC<ElementPaletteProps> = ({ onElementDragStart }) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['company', 'proposal']);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleDragStart = (e: React.DragEvent, element: PredefinedElement) => {
    e.dataTransfer.setData('application/json', JSON.stringify(element));
    onElementDragStart(element);
  };

  return (
    <Card className="w-80 h-full overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Form Elementleri</CardTitle>
        <p className="text-sm text-muted-foreground">
          Aşağıdaki elementleri PDF şablonunuza sürükleyip bırakabilirsiniz
        </p>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-100px)] overflow-y-auto">
        <div className="space-y-2 p-4">
          {PREDEFINED_ELEMENTS.map((category) => (
            <Collapsible
              key={category.id}
              open={expandedCategories.includes(category.id)}
              onOpenChange={() => toggleCategory(category.id)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto font-medium hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.name}</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {category.elements.length}
                    </span>
                  </div>
                  {expandedCategories.includes(category.id) ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pl-4">
                {category.elements.map((element) => (
                  <div
                    key={element.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, element)}
                    className="p-3 border border-border rounded-lg cursor-move hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg group-hover:scale-110 transition-transform">
                        {element.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {element.label}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {element.description}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <code className="bg-muted px-1 rounded text-xs">
                            {element.name}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};