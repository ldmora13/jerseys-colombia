import React from "react";
import { render, screen } from "@testing-library/react";
import Loader from "../Loader";

describe('Loader component', () => {
  it('should render the main container', () => {
    render(<Loader />);
    expect(document.querySelector('.loader-container')).toBeInTheDocument();
  });

  it('should render SVG loaders', () => {
    render(<Loader />);
    const svgs = document.querySelectorAll('.loader svg');
    expect(svgs.length).toBe(3);
  });
});