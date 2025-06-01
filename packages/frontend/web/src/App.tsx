import { Route, Switch } from "wouter";

import AuthPage from "./pages/auth";

import DashboardLayout from "./pages/dashboard/layout";

const App = () => (
  <>
    {/* 
      Routes below are matched exclusively -
      the first matched route gets rendered
    */}
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/app" nest>
        <Route path="/users/:id" nest>
          <Route path="/orders" />
        </Route>
      </Route>
      <Route path="/dashboard" nest>
        <DashboardLayout>
          <Route path="/models" nest>
            <Route path="/orders" />
          </Route>
          <Route path="/settings" nest>
            <Route path="/orders" />
          </Route>
        </DashboardLayout>
      </Route>

      {/* Default route in a switch */}
      <Route>404: No such page!</Route>
    </Switch>
  </>
);

export default App;
