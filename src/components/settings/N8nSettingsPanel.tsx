import React from 'react';
import N8nWebhooks from '../n8n/N8nWebhooks';

const N8nSettingsPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <N8nWebhooks />
    </div>
  );
};

export default N8nSettingsPanel;