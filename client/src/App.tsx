import { ChatPage } from './pages/ChatPage';
import '@/App.css'
import { useViewPort } from './hooks/useViewPoer';

function App() {
  useViewPort();
  return <ChatPage />;
}

export default App;