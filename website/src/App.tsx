import React from 'react';
import { Switch, Redirect, Route, withRouter, RouteComponentProps } from 'react-router-dom'
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthUserContext } from './AuthUserContext';
import { RandomBackend } from "./RandomBackend"
import { AuthUser } from "./AuthUser";
import { SubscriptionListPage } from './SubscriptionListPage';
import { SubscriptionNew } from './SubscriptionNew';

import routes from "./Routes";
import { SubscriptionViewPage } from './SubscriptionViewPage';
import { SubscriptionEditPage } from './SubscriptionEditPage';
import { UnauthenticatedApp } from './UnauthenticatedApp';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { Header } from './Header';

const appTheme = createMuiTheme({
  palette: {
    // background: { default: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)' },
    // background: { default: 'black' },
  }
});


const Page404 = () => {
  return <h1> Oops! That page couldn&apos;t be found. </h1>;
}

const UserSubscriptions = () => {
  let user = RandomBackend.getCurrentUser();
  return <h1> My Subscription for {user.displayName}, {user.id} </h1>;
}

const App = (props: any) => {
  return <BrowserRouter>
    <ThemeProvider theme={appTheme}>
      <header>
        <div className="App">
          <Home {...props} />
        </div>
      </header>
    </ThemeProvider>
  </BrowserRouter >;
};

function AuthenticatedApp() {
  return <div>
    <Header />
    <SafeRoutes />
  </div>
}

function Home(props: any) {
  const [authUser, setAuthUser] = React.useState<any>(undefined);
  React.useEffect(() => {
    RandomBackend.userStatusChange(function (user: AuthUser | null) {
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
  /* this comes from the 404 redirect */
  if (props.location.search.startsWith("?/")) {
    return <Redirect to={props.location.search.slice(1)} />;
  }

  return (
    <Switch>
      <Route exact path={routes.top} component={SubscriptionListPage} />
      <Route exact path={routes.subscriptionlist} component={SubscriptionListPage} />
      <Route exact path={routes.subscriptionNew} component={SubscriptionNew} />
      <Route exact path={routes.subscriptionView} component={SubscriptionViewPage} />
      <Route exact path={routes.subscriptionEdit} component={SubscriptionEditPage} />
      <Route exact path={routes.others} component={Page404} />
    </Switch>
  );
});

export default App;
