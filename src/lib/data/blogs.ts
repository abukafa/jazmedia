export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  likes: number;
  rating: number;
  reviewsCount?: number;
  authorName?: string;
  authorAvatar?: string;
  likedBy?: any[];
}

export const DUMMY_BLOGS: BlogPost[] = [];
