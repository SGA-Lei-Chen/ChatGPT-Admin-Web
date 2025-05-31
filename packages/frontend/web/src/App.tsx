import { Link, Route, Switch } from "wouter";

const App = () => (
  <>
    <Link href="/users/1">Profile</Link>

    <Route path="/about">About Us</Route>

    {/* 
      Routes below are matched exclusively -
      the first matched route gets rendered
    */}
    <Switch>
      {/* <Route path="/inbox" component={InboxPage} /> */}

      <Route path="/users/:name">
        {(params) => <>Hello, {params.name}!</>}
      </Route>
      <Route path="/console/:name">
        {(params) => <>Hello, {params.name}!</>}
      </Route>

      {/* Default route in a switch */}
      <Route>404: No such page!</Route>
    </Switch>
  </>
);

export default App
