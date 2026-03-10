// 📁 src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Linkedin, Instagram, MessageCircle } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1F75BB] text-white mt-16">
      <div className="container mx-auto px-4 py-10 grid md:grid-cols-4 gap-8 items-start text-center md:text-left">
        {/* Logo & slogan */}
        <div>
          <img src="/images/logo-harvest.jpg" alt="Harvest Center" className="h-14 mx-auto md:mx-0 mb-4" />
          <p className="text-sm">Empowering people through languages and communication.</p>
        </div>

        {/* Navigation (routes existantes) */}
        <div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:underline">Présentation</Link></li>
            <li><Link to="/courses" className="hover:underline">Formation</Link></li>
            <li><Link to="/#why" className="hover:underline">Pourquoi nous choisir?</Link></li>
            <li><Link to="/bourses" className="hover:underline">Bourses</Link></li>
            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>

        {/* Coordonnées */}
        <div className="text-sm">
          <p>N'Djamena, Chad</p>
          <p>Email: contact@harvestcentertd.org</p>
          <p>Phone: +235 66 68 02 00 / 99 40 20 89</p>
        </div>

        {/* Réseaux sociaux */}
        <div className="flex md:justify-end justify-center gap-4 text-white">
          <a href="https://facebook.com/harvestcenter" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-gray-200"><Facebook /></a>
          <a href="https://linkedin.com/company/harvestcenter" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-gray-200"><Linkedin /></a>
          <a href="https://instagram.com/harvestcenter" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-gray-200"><Instagram /></a>
          <a href="https://wa.me/23566680200" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="hover:text-gray-200"><MessageCircle /></a>
        </div>
      </div>

      <div className="bg-[#1863a1] text-center text-sm py-4">
        © {currentYear} Harvest Center. All rights reserved.
      </div>
    </footer>
  );
}
