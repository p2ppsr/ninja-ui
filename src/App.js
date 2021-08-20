import Welcome from './pages/Welcome'
import Ninja from './pages/Ninja'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path='/' component={Welcome} />
        <Route path='/ninja' component={Ninja} />
      </Switch>
    </Router>
  )
}

export default App
