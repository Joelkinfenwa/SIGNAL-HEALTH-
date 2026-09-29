import Link from "next/link";
import { biomarkers, biomarkerCategories } from "@/config/biomarkers";
import { products, productMarkerCount, productCategoryCount } from "@/config/products";
import { PriceTag } from "./PriceTag";
import styles from "./CompareTable.module.css";

/** Real <table>: areas of health × tests, with marker counts per cell. */
export function CompareTable() {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption className="visually-hidden">Markers per area of health in each SIGNAL test</caption>
        <thead>
          <tr>
            <th scope="col" className={styles.rowHead}>Area of health</th>
            {products.map((p) => (
              <th key={p.id} scope="col" className={p.featured ? styles.featuredHead : styles.head}>
                <Link href={`/tests/${p.slug}`} className={styles.headLink}>{p.shortName}</Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {biomarkerCategories.map((c) => {
            const inCat = biomarkers.filter((m) => m.category === c.id).map((m) => m.id);
            const counts = products.map((p) => p.markers.filter((id) => inCat.includes(id)).length);
            if (counts.every((n) => n === 0)) return null;
            return (
              <tr key={c.id}>
                <th scope="row" className={styles.rowHead}>{c.name}</th>
                {counts.map((n, i) => (
                  <td key={products[i]!.id} className={products[i]!.featured ? styles.featuredCell : styles.cell}>
                    {n > 0 ? <span className={styles.count}><span className="num">{n}</span></span> : <span className={styles.none} aria-label="Not included">–</span>}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" className={styles.rowHead}>Areas of health</th>
            {products.map((p) => <td key={p.id} className={p.featured ? styles.featuredCell : styles.cell}><strong className="num">{productCategoryCount(p)}</strong></td>)}
          </tr>
          <tr>
            <th scope="row" className={styles.rowHead}>Markers</th>
            {products.map((p) => <td key={p.id} className={p.featured ? styles.featuredCell : styles.cell}><strong className="num">{productMarkerCount(p)}</strong></td>)}
          </tr>
          <tr>
            <th scope="row" className={styles.rowHead}>Price</th>
            {products.map((p) => <td key={p.id} className={p.featured ? styles.featuredCell : styles.cell}><PriceTag priceCents={p.priceCents} /></td>)}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
