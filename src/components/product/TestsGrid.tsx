import { featuredProduct, products } from "@/config/products";
import { FeaturedProductCard } from "./FeaturedProductCard";
import { ProductCard } from "./ProductCard";
import styles from "./TestsGrid.module.css";

/** Featured product first, full width; the other four beneath. Shared by the homepage and /tests. */
export function TestsGrid({ location }: { location: string }) {
  const featured = featuredProduct();
  const others = products.filter((p) => p.id !== featured.id);
  return (
    <div className={styles.wrap}>
      <FeaturedProductCard product={featured} location={location} />
      <ul className={styles.row} aria-label="More SIGNAL tests">
        {others.map((p) => (
          <li key={p.id} className={styles.slot}><ProductCard product={p} location={location} /></li>
        ))}
      </ul>
    </div>
  );
}
