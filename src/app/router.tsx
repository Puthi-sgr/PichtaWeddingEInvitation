import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../features/wedding/pages/HomePage";
import ShowcasePage from "../features/showcase/pages/ShowcasePage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/showcase" element={<ShowcasePage />} />
      </Routes>
    </BrowserRouter>
  );
}
