import React from 'react';
import N8nLogin from '../n8n/N8nLogin';

const N8nSettingsPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">n8n Entegrasyonu</h2>
        <p className="text-muted-foreground">
          n8n instance'ınıza bağlanmak için bilgilerinizi girin
        </p>
      </div>
      
      <N8nLogin />
    </div>
  );
};

export default N8nSettingsPanel;