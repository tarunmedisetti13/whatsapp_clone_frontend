import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import ChatPage from './components/ChatPage';

import WelcomeScreen from './components/WelcomeScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<WelcomeScreen />} />
        <Route path='/welcome' element={<WelcomeScreen />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat/:wa_id/:receiver_wa_id/:receiver_name" element={<ChatPage />} />
        <Route path="/chat/:wa_id" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
