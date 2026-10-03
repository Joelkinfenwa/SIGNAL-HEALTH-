import Script from "next/script";
import { GA4_ID, META_PIXEL_ID } from "@/lib/analytics/adapters";

/**
 * Loads GA4 and the Meta Pixel when configured. Page views are sent here;
 * every other event goes through track() → dispatch(). Meta's automatic
 * advanced matching is off: we never hand Meta form data, and the server
 * sends hashed email with Purchase via the Conversions API instead.
 */
export function Analytics() {
  return (
    <>
      {GA4_ID ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA4_ID}',{send_page_view:true});`}</Script>
        </>
      ) : null}
      {META_PIXEL_ID ? (
        <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('set','autoConfig',false,'${META_PIXEL_ID}');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}</Script>
      ) : null}
    </>
  );
}
