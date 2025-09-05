// app/chat/page.tsx
import ProtectedRoute from '../components/ProtectedRoute';
import ChatInterface from '../components/ChatInterface';

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatInterface />
    </ProtectedRoute>
  );
}