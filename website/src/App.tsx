import React from 'react';
import { Switch, Redirect, Route, withRouter, RouteComponentProps } from 'react-router-dom'
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthUserContext } from './AuthUserContext';
import { GetCurrentAuthUser } from "./AuthUser";
// import { ThemeProvider } from '@material-ui/core/styles';

import { UserCredential } from '@firebase/auth-types';

require("@firebase/firestore");
require("@firebase/auth");

const firebase = require('firebase/app').default

const firebaseConfig = require('./firebaseConfig.json');
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

const googleSignInPopup = (success: any, fail: any) => {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(function (result: UserCredential) {
    if (success) {
      success(result.user)
    }
  }).catch(function (error: any) {
    if (fail) {
      console.log(error);
      fail(error);
    }
  });
}

const Page404 = () => {
  return <h1> Oops! That page couldn&apos;t be found. </h1>;
}

const AuthenicatedHome = () => {
  let user = GetCurrentAuthUser();
  return <h1> AuthenticatedHome - {user.displayName}, {user.uid} </h1>;

}

const UserSubscriptions = () => {
  // let user = React.useContext(AuthUserContext) as any;
  let user = GetCurrentAuthUser();
  return <h1> My Subscription for {user.displayName}, {user.uid} </h1>;
}

const App = (props: any) => {
  return <BrowserRouter>
    {/* <ThemeProvider theme={compactTheme}> */}
    <header>
      <div className="App">
        <Home {...props} />
      </div>
    </header>
    {/* </ThemeProvider> */}
  </BrowserRouter >;
};

function AuthenticatedApp() {
  return <div>
    <SafeRoutes />
    <p onClick={(event) => {
      firebase.auth().signOut();
    }}>
      Logout
        </p>
  </div>
}

function UnauthenticatedApp() {
  return <h1> Un-AuthenticatedApp
        <p onClick={(event) => {
      googleSignInPopup(null, null);
    }}>
      Sign in here
        </p>
  </h1>;
}

function Home(props: any) {

  const [authUser, setAuthUser] = React.useState(undefined);
  React.useEffect(() => {
    firebase.auth().onAuthStateChanged(function (user: any) {
      setAuthUser(user);
    });
  });

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
