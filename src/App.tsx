import './App.css'
import logo from './assets/logo.png'
//import Input from './components/Input/Input'
//import Button from './components/Button/button-create'
//import Board from './components/Board/Board'
import LogIn from './components/Board/LogIn'

function App() {
  return (
    <div className="app-background">
      
      <img src={logo} alt="logo" className="logo" />
      
      <div className="content-wrapper">
        <LogIn />
      </div>
    </div>
    
  )
}

export default App