export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
const { pool } = require('../../../../lib/db');

async function checkAdmin() {
  const cookieStore = cookies();
  if (cookieStore.get('admin_token')) return null;
  const session = await getServerSession(authOptions);
  if (session?.user) return null;
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function POST(req) {
  const deny = await checkAdmin();
  if (deny) return deny;

  const { articleId, customText } = await req.json();
  if (!articleId) return Response.json({ error: 'articleId required' }, { status: 400 });

  // Get article
  const articleRes = await pool.query('SELECT * FROM articles WHERE id=$1', [articleId]);
  if (articleRes.rows.length === 0) return Response.json({ error: 'Article not found' }, { status: 404 });
  const article = articleRes.rows[0];

  // Get LinkedIn token
  const tokenRes = await pool.query('SELECT access_token, expires_at FROM linkedin_tokens WHERE id=1');
  if (tokenRes.rows.length === 0) {
    return Response.json({ error: 'LinkedIn not connected. Please connect LinkedIn first.' }, { status: 400 });
  }
  const { access_token, expires_at } = tokenRes.rows[0];
  if (expires_at && new Date(expires_at) < new Date()) {
    return Response.json({ error: 'LinkedIn token expired. Please reconnect LinkedIn.' }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.optim-soln.com';
  const articleUrl = `${appUrl}/articles/${article.slug}`;
  const companyId = process.env.LINKEDIN_COMPANY_ID || '104213223';

  const postText = customText?.trim() ||
    `${article.title}\n\n${article.summary || ''}\n\nRead more: ${articleUrl}`;

  const body = {
    author: `urn:li:organization:${companyId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: postText },
        shareMediaCategory: 'ARTICLE',
        media: [
          {
            status: 'READY',
            description: { text: article.summary || article.title },
            originalUrl: articleUrl,
            title: { text: article.title },
          },
        ],
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  const liRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  });

  const liData = await liRes.json();

  if (!liRes.ok) {
    console.error('LinkedIn post failed:', liData);
    return Response.json(
      { error: liData.message || liData.errorDetails || 'LinkedIn post failed' },
      { status: liRes.status }
    );
  }

  // Mark article as posted
  await pool.query(
    'UPDATE articles SET linkedin_posted_at=NOW() WHERE id=$1',
    [articleId]
  );

  return Response.json({ success: true, postId: liData.id });
}
