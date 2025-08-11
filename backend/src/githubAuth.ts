import axios from 'axios';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL } from './config';

export async function exchangeCodeForToken(code: string) {
  const res = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: GITHUB_CALLBACK_URL,
    },
    { headers: { Accept: 'application/json' } }
  );
  return res.data.access_token as string | undefined;
}

export async function fetchGithubUser(accessToken: string) {
  const res = await axios.get('https://api.github.com/user', {
    headers: { Authorization: `token ${accessToken}`, Accept: 'application/vnd.github+json' },
  });
  return res.data as any;
}