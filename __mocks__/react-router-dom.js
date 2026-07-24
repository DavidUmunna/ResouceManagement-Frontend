const React = require("react");

const noop = () => {};

module.exports = {
  BrowserRouter: ({ children }) => React.createElement(React.Fragment, null, children),
  MemoryRouter: ({ children }) => React.createElement(React.Fragment, null, children),
  Routes: ({ children }) => React.createElement(React.Fragment, null, children),
  Route: ({ element }) => element || null,
  Navigate: ({ to }) => React.createElement("div", { "data-testid": "navigate" }, `Navigate:${to}`),
  Link: ({ children, to, ...rest }) => React.createElement("a", { href: to, ...rest }, children),
  NavLink: ({ children, to, ...rest }) => React.createElement("a", { href: to, ...rest }, children),
  Outlet: () => null,
  useNavigate: () => noop,
  useLocation: () => ({ pathname: "/", search: "", hash: "", state: null, key: "default" }),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), noop],
};
