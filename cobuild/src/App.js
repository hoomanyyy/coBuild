import logo from './logo.svg';
import './App.css';
import { Routes , Route , BrowserRouter } from "react-router-dom"
import SignupScreen from './Screens/SignupScreen';
import HomeScreen from './Screens/HomeScreen';
import VerifyCodeScreen from "./Screens/Verify_code"
import LoginScreen from './Screens/LoginScreen';
import DashboardScreen from './Screens/Dashboard';
import RoomScreen from './Screens/Room';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/signup' element={<SignupScreen />} />
        <Route path='/' element={<HomeScreen />} />
        <Route
          path="/verify-code"
          element={<VerifyCodeScreen />}
        />
        <Route 
          path='/login'
          element={<LoginScreen/>}
        />
      <Route 
        path='/dashboard'
        element={<DashboardScreen/>}
      />
      <Route 
        path='/room'
        element={<RoomScreen/>}
      />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
