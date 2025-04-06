
import React, { useState } from 'react';
import { ConversationProvider } from '@/contexts/ConversationContext';
import ConversationLayout from '@/components/conversations/ConversationLayout';
import DeviceSelector from '@/components/conversations/DeviceSelector';

const Conversations = () => {
  const [selectedDevice, setSelectedDevice] = useState('1'); // Default to first device

  return (
    <ConversationProvider>
      <div className="mb-4 flex justify-end">
        <DeviceSelector
          selectedDevice={selectedDevice}
          onSelectDevice={setSelectedDevice}
        />
      </div>
      <ConversationLayout />
    </ConversationProvider>
  );
};

export default Conversations;
