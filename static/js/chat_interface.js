window.currentChatId ??= null;
window.currentLawyerId ??= null;
window.currentLawyerName ??= null;
window.isAiGenerating ??= false;


document.querySelector('.menu-toggle').addEventListener('click', function() {
  document.querySelector('.sidebar').classList.toggle('active');
});

async function loadChats() {
  try {
    const response = await fetch('/api/chats');
    const data = await response.json();
    
    const chatList = document.getElementById('chat-list');
    chatList.innerHTML = '';
    
    if (data.chats.length === 0) {
      chatList.innerHTML = '<p class="no-chats">No chats yet</p>';
      return;
    }
    
    data.chats.forEach(chat => {
      const chatElement = document.createElement('div');
      chatElement.className = 'chat-item';
      chatElement.dataset.chatId = chat.chat_id;
      chatElement.dataset.lawyerId = chat.lawyer_id;
      
      const lastMessageTime = new Date(chat.last_message_time).toLocaleTimeString([], {
        hour: '2-digit', 
        minute: '2-digit'
      });
      
      chatElement.innerHTML = `
        <div class="chat-avatar">
          <i class="fas fa-user-tie"></i>
        </div>
        <div class="chat-info">
          <h4>${chat.lawyer_name}</h4>
          <p class="last-message">${chat.last_message}</p>
        </div>
        <div class="chat-meta">
          <span class="time">${lastMessageTime}</span>
          ${chat.unread_count > 0 ? `<span class="unread-count">${chat.unread_count}</span>` : ''}
        </div>
      `;
      
      chatElement.addEventListener('click', () => {
        openChat(chat.chat_id, chat.lawyer_id, chat.lawyer_name);
        
        if (window.innerWidth <= 768) {
          document.querySelector('.chat-main').classList.add('active');
        }
      });
      
      chatList.appendChild(chatElement);
    });
  } catch (error) {
    console.error('Error loading chats:', error);
  }
}

async function openChat(chatId, lawyerId, lawyerName) {
  currentChatId = chatId;
  currentLawyerId = lawyerId;
  currentLawyerName = lawyerName;
  
  document.getElementById('chat-header').innerHTML = `
    <div class="lawyer-info">
      <button class="back-button" id="back-button"><i class="fas fa-arrow-left"></i></button>
      <div class="lawyer-avatar">
        <i class="fas fa-user-tie"></i>
      </div>
      <div>
        <h3>${lawyerName}</h3>
      </div>
    </div>
  `;

  document.getElementById('back-button').addEventListener('click', function() {
    document.querySelector('.chat-main').classList.remove('active');
    currentChatId = null;
    currentLawyerId = null;
    currentLawyerName = null;
    document.getElementById('chat-input-container').style.display = 'none';
    document.getElementById('chat-header').innerHTML = '';
    document.getElementById('chat-messages').innerHTML = '<p class="no-chat">Select a chat to start messaging</p>';
  });
  
  document.getElementById('chat-input-container').style.display = 'block';
  
  await loadMessages(chatId);
  await markMessagesAsRead(chatId);
  loadChats();
}

async function loadMessages(chatId) {
  try {
    const response = await fetch(`/chat/${chatId}`);
    const chat = await response.json();
    const messagesDiv = document.getElementById('chat-messages');

    messagesDiv.innerHTML = '';

    chat.messages.forEach(msg => {
      const div = document.createElement('div');
      div.className = `message ${msg.sender === 'user' ? 'sent' : 'received'}`;
      
      const aiIndicator = msg.ai_assisted ? '<span class="ai-badge"><i class="fas fa-robot"></i> AI Assisted</span>' : '';
      
      div.innerHTML = `
        <p>${msg.message}</p>
        <div class="message-meta">
          <span class="time">${new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          ${aiIndicator}
        </div>
      `;
      messagesDiv.appendChild(div);
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}

// Generate AI assistance for the current chat
async function generateAiAssistance() {
  if (!currentChatId || isAiGenerating) return;
  
  isAiGenerating = true;
  const aiButton = document.getElementById('ai-assist-btn');
  const messageInput = document.getElementById('message-input');
  
  aiButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  aiButton.disabled = true;
  
  try {
    const response = await fetch(`/chat/${currentChatId}/ai-assist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    
    if (data.success) {
      messageInput.value = data.suggested_message;
      messageInput.focus();
      
      showAiContext(data.context);
    } else {
      showNotification('Failed to generate AI assistance: ' + data.error, 'error');
    }
  } catch (error) {
    console.error('Error generating AI assistance:', error);
    showNotification('Error generating AI assistance', 'error');
  } finally {
  
    aiButton.innerHTML = '<i class="fas fa-robot"></i>';
    aiButton.disabled = false;
    isAiGenerating = false;
  }
}

// Show AI context information
function showAiContext(context) {
  const contextDiv = document.createElement('div');
  contextDiv.className = 'ai-context-info';
  contextDiv.innerHTML = `
    <div class="context-header">
      <i class="fas fa-info-circle"></i>
      <span>AI Assistance Context</span>
    </div>
    <div class="context-details">
      <p><strong>Based on:</strong> ${context.main_query}</p>
      <p><strong>Your Progress:</strong> ${context.progress_percentage.toFixed(1)}% complete</p>
      <p><strong>Chat History:</strong> ${context.recent_messages} messages analyzed</p>
    </div>
  `;
  
  const chatContainer = document.querySelector('.chat-input-container');
  chatContainer.insertBefore(contextDiv, chatContainer.firstChild);
  
  // Remove after 5 seconds
  setTimeout(() => {
    if (contextDiv && contextDiv.parentNode) {
      contextDiv.remove();
    }
  }, 5000);
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Send a message
async function sendMessage() {
  const input = document.getElementById('message-input');
  const text = input.value.trim();
  
  if (!text || !currentChatId) return;
  
  // Check if this message was AI-generated
  const isAiAssisted = input.dataset.aiGenerated === 'true';
  
  try {
    await fetch(`/chat/${currentChatId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        sender: 'user', 
        message: text,
        ai_assisted: isAiAssisted
      })
    });
    
    input.value = '';
    input.dataset.aiGenerated = 'false';
    await loadMessages(currentChatId);
    await loadChats();
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Track when input is modified after AI generation
document.addEventListener('DOMContentLoaded', function() {
  const messageInput = document.getElementById('message-input');
  if (messageInput) {
    messageInput.addEventListener('input', function() {
      // Mark as AI-generated if it was populated by AI
      if (this.dataset.aiGenerated !== 'true' && this.value.length > 100) {
        this.dataset.aiGenerated = 'false';
      }
    });
  }
});

// Mark messages as read
async function markMessagesAsRead(chatId) {
  try {
    await fetch(`/chat/${chatId}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
}

// Load lawyers for new chat modal
async function loadLawyersForModal() {
  try {
    const response = await fetch('/api/lawyers');
    const lawyers = await response.json();
    
    const lawyerList = document.getElementById('lawyer-list-modal');
    lawyerList.innerHTML = '';
    
    lawyers.forEach(lawyer => {
      const lawyerElement = document.createElement('div');
      lawyerElement.className = 'lawyer-item';
      lawyerElement.dataset.lawyerId = lawyer._id;
      
      lawyerElement.innerHTML = `
        <div class="lawyer-avatar">
          <i class="fas fa-user-tie"></i>
        </div>
        <div class="lawyer-info">
          <h4>${lawyer.name}</h4>
          <p>${lawyer.specialization}</p>
        </div>
      `;
      
      lawyerElement.addEventListener('click', async () => {
        await startNewChat(lawyer._id);
        document.getElementById('new-chat-modal').classList.add('hidden');
      });
      
      lawyerList.appendChild(lawyerElement);
    });
  } catch (error) {
    console.error('Error loading lawyers:', error);
  }
}

// Start a new chat
async function startNewChat(lawyerId) {
  try {
    const response = await fetch('/chat/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lawyer_id: lawyerId })
    });
    
    const data = await response.json();
    
    const lawyerResponse = await fetch(`/api/lawyer/${lawyerId}`);
    const lawyer = await lawyerResponse.json();
    
    openChat(data.chat_id, lawyerId, lawyer.name);
    loadChats();
  } catch (error) {
    console.error('Error starting new chat:', error);
  }
}

// Event listeners
document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('message-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

document.addEventListener('DOMContentLoaded', function() {
  const aiAssistBtn = document.getElementById('ai-assist-btn');
  if (aiAssistBtn) {
    aiAssistBtn.addEventListener('click', generateAiAssistance);
  }
});

document.getElementById('new-chat-btn').addEventListener('click', () => {
  document.getElementById('new-chat-modal').classList.remove('hidden');
  loadLawyersForModal();
});

document.querySelector('.close-btn').addEventListener('click', () => {
  document.getElementById('new-chat-modal').classList.add('hidden');
});

window.addEventListener('click', (e) => {
  const modal = document.getElementById('new-chat-modal');
  if (e.target === modal) {
    modal.classList.add('hidden');
  }
});

loadChats();

setInterval(() => {
  if (currentChatId) {
    loadMessages(currentChatId);
  }
  loadChats();
}, 5000);