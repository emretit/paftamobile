import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const TemplateManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Şablon Yönetimi</h2>
        <p className="text-muted-foreground">
          PDF şablonlarını yönetin ve düzenleyin
        </p>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Şablonlar</TabsTrigger>
          <TabsTrigger value="settings">Ayarlar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Şablonlar yakında eklenecek...</p>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Ayarlar yakında eklenecek...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};