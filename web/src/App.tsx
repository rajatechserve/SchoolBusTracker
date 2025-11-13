import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Buses from './pages/Buses';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Dashboard} />
        <Route path="/students" component={Students} />
        <Route path="/buses" component={Buses} />
      </Switch>
    </Router>
  );
};

export default App;