export function JsonLd() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'StocksX',
        alternateName: 'StocksX - Indian Stock Market Analysis',
        url: 'https://www.stocksx.info',
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
