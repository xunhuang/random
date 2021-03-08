import React from 'react';
import { Switch, Redirect, Route, withRouter, RouteComponentProps } from 'react-router-dom'
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthUserContext } from './AuthUserContext';
import { RandomBackend } from "./RandomBackend"
import { AuthUser } from "./AuthUser";

const Page404 = () => {
  return <h1> Oops! That page couldn&apos;t be found. </h1>;
}

const AuthenicatedHome = () => {
  let user = RandomBackend.getCurrentUserNotNull();
  return <h1> AuthenticatedHome - {user.displayName}, {user.uid} </h1>;

}

const UserSubscriptions = () => {
  // let user = React.useContext(AuthUserContext) as any;
  let user = RandomBackend.getCurrentUserNotNull();
  return <h1> My Subscription for {user.displayName}, {user.uid} </h1>;
}

const App = (props: any) => {
  return <BrowserRouter>
    <header>
      <div className="App">
        <Home {...props} />
      </div>
    </header>
  </BrowserRouter >;
};

function AuthenticatedApp() {
  return <div>
    <SafeRoutes />
    <p onClick={(event) => {
      RandomBackend.logout();
    }}>
      Logout
        </p>
  </div>
}

function UnauthenticatedApp() {
  return <h1> Un-AuthenticatedApp xxx
        <p onClick={(event) => {
      console.log("clicked");
      RandomBackend.login();
    }}>
      Sign in here
        </p>
  </h1>;
}

function Home(props: any) {
  const [authUser, setAuthUser] = React.useState<any>(undefined);
  React.useEffect(() => {
    RandomBackend.userStatusChange(function (user) {
      setAuthUser(user);
    });
  }, []);

  if (authUser === undefined) return <h2> Loading</h2>;

  return (authUser) ?
    <AuthUserContext.Provider value={authUser}>
      <AuthenticatedApp />
    </AuthUserContext.Provider>
    : <UnauthenticatedApp />;
}

const SafeRoutes = withRouter((props: RouteComponentProps) => {
  /* this came from the 404 redirect */
  if (props.location.search.startsWith("?/")) {
    return <Redirect to={props.location.search.slice(1)} />;
  }

  return (
    <Switch>
      <Route exact path="/" component={AuthenicatedHome} />
      <Route exact path="/sub" component={UserSubscriptions} />
      <Route exact path="*" component={Page404} />
    </Switch>
  );
});

export default App;
