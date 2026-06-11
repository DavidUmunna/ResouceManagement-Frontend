import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import AppLayout from "../AppLayout";
import { useLocation } from "react-router-dom";

jest.mock("react-router-dom", () => ({
  Outlet: () => <div data-testid="outlet-content">Outlet Content</div>,
  useLocation: jest.fn(),
}));

jest.mock("../navBar", () => () => <div data-testid="navbar">Navbar</div>);

jest.mock("../../skeletons/Navbar_skeleton", () => () => (
  <div data-testid="navbar-skeleton">Navbar Skeleton</div>
));

jest.mock("../Footer/footer", () => () => <div data-testid="footer">Footer</div>);

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

jest.mock("../usercontext", () => ({
  useUser: jest.fn(() => ({ name: "Test User", role: "admin" })),
}));

const mockedUseLocation = useLocation;
let mockedLocation = { pathname: "/", search: "" };

describe("AppLayout", () => {
  beforeEach(() => {
    mockedUseLocation.mockImplementation(() => mockedLocation);
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it("shows navbar skeleton when loading prop is true", () => {
    mockedLocation = { pathname: "/admin/dashboard", search: "" };

    render(<AppLayout isLoading />);

    expect(screen.getByTestId("navbar-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("navbar")).not.toBeInTheDocument();
    expect(screen.getByTestId("outlet-content")).toBeInTheDocument();
  });

  it("shows navbar and outlet when loading prop is false", () => {
    mockedLocation = { pathname: "/admin/dashboard", search: "" };

    render(<AppLayout isLoading={false} />);

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("outlet-content")).toBeInTheDocument();

    expect(screen.queryByTestId("navbar-skeleton")).not.toBeInTheDocument();
  });

});
