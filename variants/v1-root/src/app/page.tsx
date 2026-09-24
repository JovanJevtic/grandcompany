import HashScroll from "@/components/HashScroll";
import Shop from "@/components/shop/Shop";
import ShopHeader from "@/components/shop/ShopHeader";

export default function Home() {
  return (
    <>
      <ShopHeader />
      <main>
        <Shop />
      </main>
      <HashScroll />
    </>
  );
}
