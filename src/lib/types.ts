export interface Blog {
  id: string;
  _id?: string;
  slug?: string;
  title: string;
  excerpt?: string;
  content?: string;
  image: string;
  category: string;
  date: string;
  readTime?: string;
  likes?: number;
  rating?: number;
  reviewsCount?: number;
  authorName?: string;
  authorAvatar?: string;
  likedBy?: any[];
}
