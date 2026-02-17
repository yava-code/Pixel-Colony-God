import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadCreation = async (
  userId: string,
  title: string,
  canvasData: string,
  thumbnail: string | null,
  description: string = '',
  isPublic: boolean = false
) => {
  const { data, error } = await supabase.from('saved_creations').insert([
    {
      user_id: userId,
      title,
      description,
      canvas_data: canvasData,
      thumbnail,
      is_public: isPublic,
    },
  ]);

  if (error) throw error;
  return data;
};

export const getCreations = async (userId: string) => {
  const { data, error } = await supabase
    .from('saved_creations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getPublicGallery = async (limit: number = 12) => {
  const { data, error } = await supabase
    .from('saved_creations')
    .select('*, gallery_likes(count)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select();

  if (error) throw error;
  return data;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const createUserProfile = async (userId: string, username: string = '') => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([
      {
        id: userId,
        username: username || `user_${userId.slice(0, 8)}`,
        avatar_color: '#60A5FA',
        theme: 'dark',
        sound_enabled: true,
        notifications_enabled: true,
      },
    ])
    .select();

  if (error) throw error;
  return data;
};

export const addAchievement = async (userId: string, achievementKey: string, title: string) => {
  const { data, error } = await supabase.from('user_achievements').insert([
    {
      user_id: userId,
      achievement_key: achievementKey,
      title,
    },
  ]);

  if (error && !error.message.includes('duplicate')) throw error;
  return data;
};

export const toggleLike = async (userId: string, creationId: string, isLiked: boolean) => {
  if (isLiked) {
    const { error } = await supabase
      .from('gallery_likes')
      .delete()
      .eq('user_id', userId)
      .eq('creation_id', creationId);

    if (error) throw error;
  } else {
    const { data, error } = await supabase.from('gallery_likes').insert([
      {
        user_id: userId,
        creation_id: creationId,
      },
    ]);

    if (error) throw error;
    return data;
  }
};
