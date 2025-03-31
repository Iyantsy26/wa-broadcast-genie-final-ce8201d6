
import { getConversations } from './conversations/getConversations';
import { getMessages } from './conversations/getMessages';
import { sendMessage } from './conversations/sendMessage';
import { createConversation } from './conversations/createConversation';
import { deleteConversation } from './conversations/deleteConversation';
import { archiveConversation } from './conversations/archiveConversation';
import { addTagToConversation, removeTag } from './conversations/tagOperations';
import { assignConversation } from './conversations/assignOperations';
import { 
  getWhatsAppAccounts, 
  addWhatsAppAccount,
  updateWhatsAppAccountStatus,
  checkAdminStatus,
  addUserAsAdmin,
  WhatsAppAccount 
} from './whatsAppService';

export {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
  deleteConversation,
  archiveConversation,
  addTagToConversation,
  removeTag,
  assignConversation,
  getWhatsAppAccounts,
  addWhatsAppAccount,
  updateWhatsAppAccountStatus,
  checkAdminStatus,
  addUserAsAdmin,
  type WhatsAppAccount
};
