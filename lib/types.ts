export type UserBase = {
  email: string;
  image: string;
  name: string;
};

export type UserProfile = UserBase & {
  id: string;
  created_at: string;
  updated_at: string;
};
