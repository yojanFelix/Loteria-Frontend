import './App.css'
import logo from './assets/logo.png'
import Input from './components/Input/Input'
import Button from './components/Button/button-create'
function App() {
  return (
    <div className="app-background">
      
      <img src={logo} alt="logo" className="logo" />
      <div className="text-wrapper">
        <h3 className="text">Ingresa el codigo de la sala</h3>
      </div>
      <div className="content-wrapper">
        
        <Input />
      </div>
      <div className="button-wrapper">
        <Button />
      </div>
      
    </div>
    
  )
}

export default App