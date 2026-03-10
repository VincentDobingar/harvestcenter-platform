// 📁 src/pages/Home.jsx
import HomeHero from "@/components/HomeHero";
import HomeAbout from "@/components/HomeAbout";
import HomeTraining from "@/components/HomeTraining";
import HomeWhyUs from "@/components/HomeWhyUs";
import HomeTestimonial from "@/components/HomeTestimonial";
import HomeContact from "@/components/HomeContact";
import HomePartners from "@/components/HomePartners";
import HomeGalerie from "@/components/HomeGalerie";
import HomeNews from "@/components/HomeNews";

export default function Home() {
  return (
    <main className="space-y-24">
      <HomeHero />
      <section className="max-w-7xl mx-auto px-4">
        <HomeAbout />
      </section>
      <section className="max-w-7xl mx-auto px-4">
        <HomeTraining />
      </section>
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <HomeWhyUs />
        </div>
      </section>
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <HomeNews />
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4">
        <HomeGalerie />
      </section>
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <HomePartners />
        </div>
      </section>
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <HomeTestimonial />
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4">
        <HomeContact />
      </section>
    </main>
  );
}
