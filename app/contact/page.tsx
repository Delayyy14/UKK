'use client'

import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import MainNavbar from "@/components/MainNavbar";

export default function ContactPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <MainNavbar />
            <main className="flex-1">
                <ContactSection />
            </main>
            <Footer />
        </div>
    );
}