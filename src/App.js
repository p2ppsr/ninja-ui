import React from 'react'
import Welcome from './pages/Welcome'
import Ninja from './pages/Ninja'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <div>
      <Router>
        <Switch>
          <Route exact path='/' component={Welcome} />
          <Route path='/ninja' component={Ninja} />
        </Switch>
      </Router>
      <ToastContainer />
    </div>
  )
}

export default App
