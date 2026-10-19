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
    <main>
      <HomeHero />
      <HomeAbout />
      <HomeTraining />
      <HomeNews />
      <HomeWhyUs />
      <div className="bg-white">
        <div className="mx-auto max-w-7xl">
          <HomeGalerie />
        </div>
      </div>
      <div className="border-t border-line bg-paper">
        <div className="mx-auto max-w-7xl">
          <HomePartners />
        </div>
      </div>
      <HomeTestimonial />
      <div className="bg-white">
        <div className="mx-auto max-w-7xl">
          <HomeContact />
        </div>
      </div>
    </main>
  );
}
