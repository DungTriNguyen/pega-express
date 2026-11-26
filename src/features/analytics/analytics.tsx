"use client";

import Script from "next/script";
import { publicEnv } from "@/shared/config/public-env";
import { useConsent } from "@/features/consent";

/**
 * - Cloudflare Web Analytics: bật khi có token, không cookie, tải sau khi trang rảnh.
 * - GA4 + Meta Pixel: làm sẵn, mặc định TẮT; chỉ tải khi có ID trong env VÀ khách bấm "Đồng ý".
 */
export function Analytics() {
  const consent = useConsent();
  const { cfAnalyticsToken, ga4Id, metaPixelId } = publicEnv;
  const granted = consent === "granted";
  return (
    <>
      {cfAnalyticsToken && (
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          strategy="lazyOnload"
          data-cf-beacon={JSON.stringify({ token: cfAnalyticsToken })}
        />
      )}
      {granted && ga4Id && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="lazyOnload" />
          <Script id="ga4-init" strategy="lazyOnload">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga4Id}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {granted && metaPixelId && (
        <Script id="meta-pixel" strategy="lazyOnload">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
