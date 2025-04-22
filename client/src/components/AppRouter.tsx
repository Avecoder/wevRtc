import { Route, Routes } from "react-router-dom";
import { routes } from "../router";


export const AppRouter = () => {


  return (
    <Routes>
      {routes.map(({ path, Component }, i) => (
        <Route path={path} element={<Component />} key={i}></Route>
      ))}
    </Routes>
  );
};