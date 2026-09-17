import './App.css'
import logo from './assets/logo.png'
//import Input from './components/Input/Input'
//import Button from './components/Button/button-create'
//import Board from './components/Board/Board'

function App() {
  return (
    <div className="app-background">
      
      <img src={logo} alt="logo" className="logo" />
      <div className="text-wrapper">
        <h3 className="text">Ingresa tu numero de cuenta</h3>
      </div>
      
    </div>
    
  )
}

export default App