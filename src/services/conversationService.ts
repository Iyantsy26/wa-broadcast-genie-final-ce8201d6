
// This file is maintained for backward compatibility
// It re-exports all functionality from the modularized conversation services
export {
  getConversations,
  getMessages,
  sendMessage,
  deleteConversation,
  archiveConversation,
  addTagToConversation,
  assignConversation,
  createConversation
} from './conversations';
