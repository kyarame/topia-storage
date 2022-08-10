import { tw } from "twind";
import { Route, useLocation } from "wouter";
import Home from "./Home";
import Viewer from "./Viewer";

function App() {
  const [location] = useLocation();

  return (
    <div className={tw`bg-gray-100 w-full h-full`}>
      <Home />
      <Route path="/:filename">
        <Viewer filename={location.replace(/^\//, "")} />
      </Route>
    </div>
  );
}

export default App;
