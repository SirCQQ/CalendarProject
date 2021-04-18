import './App.css'
import Auth from './components/Auth/Auth'
import Calendar from './components/Calendar/Calendar'
import {useCookies} from 'react-cookie'
function App() {
  const [cookies, setCookie] = useCookies(['token']);
  return (
    <div >
      {cookies['token'] ?
        <Calendar />:
        <Auth/>
      }
    </div>
  );
}

export default App;
