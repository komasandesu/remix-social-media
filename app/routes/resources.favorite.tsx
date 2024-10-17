// app/routes/resources/favorite.ts
import { json, ActionFunctionArgs } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';
import { favoriteRepository } from '~/models/favorite.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const formData = await request.formData();
  const PostId = Number(formData.get('PostId'));

  if (!PostId) {
    return json({ error: 'Invalid post ID' }, { status: 400 });
  }

  try {
    const result = await favoriteRepository.toggleFavorite({
      PostId: PostId,
      userId: user.id,
    });

    // お気に入り数を取得
    const favoriteCount = await favoriteRepository.countFavorites(PostId);

    return json({ success: true, added: result.added, favoriteCount });
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    return json({ error: 'Failed to toggle favorite' }, { status: 500 });
  }
};
