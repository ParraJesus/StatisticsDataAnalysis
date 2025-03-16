import { Navigate } from "react-router-dom";

//Layout
import Layout from "./static/Layout.jsx";

//Pages
import FilterZ1 from "./pages/onedimensional/FilterZ1.jsx";
import FilterZ2 from "./pages/onedimensional/FilterZ2.jsx";
import FilterBP1 from "./pages/onedimensional/FilterBP1.jsx";
import FilterBP2 from "./pages/onedimensional/FilterBP2.jsx";
import OneTabulation from "./pages/onedimensional/Tabulation.jsx";
import Synthetic from "./pages/onedimensional/Synthetic.jsx";
import RelativeTabulation from "./pages/twodimensional/RelativeTabulation.jsx";
import CorrelationalTabulation from "./pages/multidimensional/CorrelationalTabulation.jsx";

const routes = [
  {
    path: "/*",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <Navigate to="/onedimensional/filters/zscore1" replace />,
      },
    ],
  },
  {
    path: "/onedimensional/filters",
    element: <Layout />,
    children: [
      {
        path: "zscore1",
        element: <FilterZ1 />,
      },
      {
        path: "zscore2",
        element: <FilterZ2 />,
      },
      {
        path: "boxplot1",
        element: <FilterBP1 />,
      },
      {
        path: "boxplot2",
        element: <FilterBP2 />,
      },
    ],
  },
  {
    path: "/onedimensional",
    element: <Layout />,
    children: [
      {
        path: "tabulation",
        element: <OneTabulation />,
      },
      {
        path: "synthetic",
        element: <Synthetic />,
      },
    ],
  },
  {
    path: "/twodimensional",
    element: <Layout />,
    children: [
      {
        path: "tabulation",
        element: <RelativeTabulation />,
      },
    ],
  },
  {
    path: "/multidimensional",
    element: <Layout />,
    children: [
      {
        path: "correlation",
        element: <CorrelationalTabulation />,
      },
    ],
  },
];

export default routes;
