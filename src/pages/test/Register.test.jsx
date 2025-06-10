jest.mock("../../lib/firebaseConfig", () => require("../../lib/test/firebase.mock"));
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "../Register";
import { BrowserRouter } from "react-router-dom";

const { createUserWithEmailAndPassword } = require("firebase/auth");
const { signInWithPopup } = require("firebase/auth");

jest.mock("firebase/auth", () => ({
    createUserWithEmailAndPassword: jest.fn(),
    updateProfile: jest.fn(),
    GoogleAuthProvider: jest.fn(),
    signInWithPopup: jest.fn(),
}));

// Mock de imágenes
jest.mock("../assets/football-jersey.svg", () => "logo.svg");
jest.mock("../assets/google.svg", () => "googlelogo.svg");

const renderWithRouter = (ui) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("Register", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renderiza el formulario de registro", () => {
        renderWithRouter(<Register />);
        expect(screen.getByPlaceholderText(/Nombres/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Apellido/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
        expect(screen.getByText(/Registrarse/i)).toBeInTheDocument();
    });

    it("muestra alerta si faltan campos", async () => {
        renderWithRouter(<Register />);
        fireEvent.click(screen.getByText(/Registrarse/i));
        await waitFor(() => {
            expect(screen.getByText(/Todos los campos son obligatorios/i)).toBeInTheDocument();
        });
    });

    it("muestra alerta si el correo ya está en uso", async () => {
        createUserWithEmailAndPassword.mockRejectedValue({ code: "auth/email-already-in-use" });

        renderWithRouter(<Register />);
        fireEvent.change(screen.getByPlaceholderText(/Nombres/i), { target: { value: "Juan" } });
        fireEvent.change(screen.getByPlaceholderText(/Apellido/i), { target: { value: "Pérez" } });
        fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: "juan@mail.com" } });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: "123456" } });
        fireEvent.click(screen.getByText(/Registrarse/i));
        await waitFor(() => {
            expect(screen.getByText(/El correo ya está en uso/i)).toBeInTheDocument();
        });
    });


    it("permite hacer login con Google", async () => {
        signInWithPopup.mockResolvedValue({ user: { uid: "123" } });

        renderWithRouter(<Register />);
        fireEvent.click(screen.getByRole("button", { name: /Google login/i }));
        await waitFor(() => {
            expect(signInWithPopup).toHaveBeenCalled();
        });
    });
});