import { Packages } from "@/components/sectionBlocks/homepage/packages/Packages";
import { Banner } from "@/components/sectionBlocks/homepage/banner/Banner";
import PackageCarousel from "@/components/sectionBlocks/homepage/packageCarousel/PackageCarousel";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <Banner />
      <Packages />
      <PackageCarousel />
    </>
  );
}
