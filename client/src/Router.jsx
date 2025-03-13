import { Routes, Route } from "react-router-dom";
import routes from "./RoutesConfig";

function AppRouter() {
  return (
    <Routes>
      {routes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element}>
          {route.children?.map((child, idx) => (
            <Route key={idx} path={child.path} element={child.element} />
          ))}
        </Route>
      ))}
    </Routes>
  );
}

export default AppRouter;
