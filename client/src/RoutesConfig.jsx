//Layout
import Layout from "./static/Layout.jsx";

//Pages
import FilterZ1 from "./pages/onedimensional/FilterZ1.jsx";
import FilterZ2 from "./pages/onedimensional/FilterZ2.jsx";
import FilterBP1 from "./pages/onedimensional/FilterBP1.jsx";
import FilterBP2 from "./pages/onedimensional/FilterBP2.jsx";

const routes = [
  {
    path: "/*",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <FilterZ1 />,
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
        path: "boxplo2",
        element: <FilterBP2 />,
      },
    ],
  },
];

export default routes;
