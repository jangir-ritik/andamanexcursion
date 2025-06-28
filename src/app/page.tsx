import { Packages } from "@/components/sectionBlocks/homepage/packages/Packages";
import { Banner } from "@/components/sectionBlocks/homepage/banner/Banner";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <Banner />

      <Packages />
    </>
  );
}
