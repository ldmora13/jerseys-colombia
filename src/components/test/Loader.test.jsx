import React from "react";
import { render, screen } from "@testing-library/react";
import Loader from "../Loader";

describe('Loader component', () => {
  it('se renderiza el contenedor principal', () => {
    render(<Loader />);
    expect(document.querySelector('.loader-container')).toBeInTheDocument();
  });

  it('renderiza tres loaders SVG', () => {
    render(<Loader />);
    const svgs = document.querySelectorAll('.loader svg');
    expect(svgs.length).toBe(3);
  });

  it('renderiza un círculo, un triángulo y un rectángulo', () => {
    render(<Loader />);
    expect(document.querySelector('circle')).toBeInTheDocument();
    expect(document.querySelector('polygon')).toBeInTheDocument();
    expect(document.querySelector('rect')).toBeInTheDocument();
  });
});