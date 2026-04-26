import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Product Image';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  let product;
  try {
    const res = await fetch(`${apiUrl}/products/${id}`);
    if (res.ok) {
      product = await res.json();
    }
  } catch (e) {
    console.error('Error fetching product for OG image', e);
  }

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 48,
          }}
        >
          DreamBook
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
          width: '100%',
          height: '100%',
          display: 'flex',
          padding: '60px 80px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '55%',
          }}
        >
          <div
            style={{
              color: '#ef4444',
              fontSize: '20px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              marginBottom: '24px',
            }}
          >
            DreamBook
          </div>
          <div
            style={{
              color: 'white',
              fontSize: '60px',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '16px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.title}
          </div>
          <div
            style={{
              color: '#94a3b8',
              fontSize: '28px',
              fontWeight: 500,
              marginBottom: '48px',
            }}
          >
            {product.author?.name ? `By ${product.author.name}` : 'Premium Selection'}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <div
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '12px 30px',
                borderRadius: '12px',
                fontSize: '36px',
                fontWeight: 800,
              }}
            >
              {Number(product.price).toLocaleString('vi-VN')} đ
            </div>
            {product.genre?.name && (
              <div
                style={{
                  border: '1px solid #334155',
                  color: '#cbd5e1',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontSize: '20px',
                  fontWeight: 600,
                }}
              >
                {product.genre.name}
              </div>
            )}
          </div>
        </div>

        {/* Right Content - Image */}
        <div
          style={{
            display: 'flex',
            width: '38%',
            height: '480px',
            position: 'relative',
          }}
        >
          {/* Shadow effect behind the book */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              right: '-10px',
              bottom: '-10px',
              background: 'rgba(0,0,0,0.4)',
              borderRadius: '16px',
              filter: 'blur(20px)',
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '16px',
              border: '4px solid rgba(255,255,255,0.1)',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
