import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import NeighborsPreview from "@/components/NeighborsPreview";
import Routines from "@/components/Routines";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main>
                <Hero />
                <HowItWorks />
                <Routines />
                <NeighborsPreview />
                <CTA />
            </main>
            <Footer />
        </div>
    );
};

export default Index;
