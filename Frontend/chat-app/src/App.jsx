import React from 'react'
import {BrowserRouter as Router,Routes,Route} from "react-router-dom"
import Home  from './components/home'
import Login from './components/login'
import Register from './components/Registration'
import Index from './components/index'

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home></Home>}></Route>
        <Route path='/Login' element={<Login></Login>}></Route>
        <Route path='/Register' element={<Register></Register>}></Route>
        <Route path='/Index' element={<Index></Index>}></Route>
      </Routes>
    </Router>
  )
}

export default App
