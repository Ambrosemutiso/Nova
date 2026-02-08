export default function robots() {
  const baseUrl = "https://novaxmax.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/seller/",
          "/admin/",
          "/checkout",
          "/cart",
          "/auth",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
