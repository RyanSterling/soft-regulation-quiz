// Edge function to inject page-specific Open Graph meta tags for /apply
export default async (request, context) => {
  const response = await context.next();

  // Only modify HTML responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('text/html')) {
    return response;
  }

  let html = await response.text();

  // OG tags for the 1:1 Coaching Application page
  const ogTags = `
    <meta property="og:title" content="1:1 Business Coaching with Maggie Sterling" />
    <meta property="og:description" content="Private coaching for online business owners and creators dealing with nervous system symptoms. Strategic business coaching meets nervous system work." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://softregulationsystem.com/apply" />
    <meta property="og:image" content="https://softregulationsystem.com/assets/maggie-18.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="1:1 Business Coaching with Maggie Sterling" />
    <meta name="twitter:description" content="Private coaching for online business owners and creators dealing with nervous system symptoms." />
    <meta name="twitter:image" content="https://softregulationsystem.com/assets/maggie-18.jpg" />
  `;

  // Replace title for /apply page
  html = html.replace(
    '<title>Nervous System Quiz</title>',
    '<title>1:1 Business Coaching Application | Maggie Sterling</title>'
  );

  // Inject OG tags into head
  html = html.replace('</head>', `${ogTags}</head>`);

  return new Response(html, {
    headers: response.headers,
  });
};
