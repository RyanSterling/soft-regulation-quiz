// Edge function to inject page-specific Open Graph meta tags for /challenge
export default async (request, context) => {
  const response = await context.next();

  // Only modify HTML responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('text/html')) {
    return response;
  }

  let html = await response.text();

  // OG tags for the 14-Day Challenge page
  const ogTags = `
    <meta property="og:title" content="14-Day Challenge: Let Life Be the Regulator" />
    <meta property="og:description" content="Join Maggie for 14 days of letting life be the regulator. $33 for community, live calls, and daily guidance. Starts October 12." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://softregulationsystem.com/challenge" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="14-Day Challenge: Let Life Be the Regulator" />
    <meta name="twitter:description" content="Join Maggie for 14 days of letting life be the regulator. $33 for community, live calls, and daily guidance. Starts October 12." />
  `;

  // Replace title for /challenge page
  html = html.replace(
    '<title>Nervous System Quiz</title>',
    '<title>14-Day Challenge | Maggie Sterling</title>'
  );

  // Inject OG tags into head
  html = html.replace('</head>', `${ogTags}</head>`);

  return new Response(html, {
    headers: response.headers,
  });
};
