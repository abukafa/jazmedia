export interface BlogPost {
  id: string;
  title: string;
  subtitle: string;
  welcomeTitle: string;
  locationTitle: string;
  locationAddress: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  likes: number;
  rating: number;
  reviewsCount: number;
  priceOrTag: string;
  distanceOrMeta: string;
}

export const DUMMY_BLOGS: BlogPost[] = [
  {
    id: "blog-1",
    title: "Cliff Front Pandawa Beach",
    subtitle: "Welcome To",
    welcomeTitle: "Cliff Front Pandawa Beach",
    locationTitle: "Pandawa Limestone Cliff Sanctuary",
    locationAddress: "Bali, Indonesia",
    excerpt:
      "Pandawa Beach, located in South Kuta Bali, is one of the most awe-inspiring coastal wonders on the island. Carved through towering limestone cliffs, it offers a breathtaking view over the Indian Ocean...",
    content:
      "Pandawa Beach, located in South Kuta Bali, is one of the most awe-inspiring coastal wonders on the island. Carved through towering limestone cliffs over many years, Pandawa is a breathtaking blend of natural drama and serene white sand shores. Whether you are kayaking across crystalline turquoise waters or exploring the grand limestone statues of the Pandawa brothers carved into the cliffs, every moment here feels like a cinematic masterpiece.",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1000&auto=format&fit=crop&q=80",
    category: "Travelogue",
    date: "4 Agustus 2026",
    readTime: "4 min read",
    likes: 455,
    rating: 4.9,
    reviewsCount: 455,
    priceOrTag: "$240",
    distanceOrMeta: "277 miles away",
  },
  {
    id: "blog-2",
    title: "Grand Canyon National Park",
    subtitle: "Welcome To",
    welcomeTitle: "Grand Canyon National Park",
    locationTitle: "Colorado River Basin Heritage",
    locationAddress: "Arizona, United States",
    excerpt:
      "Grand Canyon National Park, located in Arizona, is one of the most awe-inspiring natural wonders on the planet. Carved by the Colorado River over millions of years, the Grand Canyon is a breathtaking landscape...",
    content:
      "Grand Canyon National Park, located in Arizona, is one of the most awe-inspiring natural wonders on the planet. Carved by the Colorado River over millions of years, the Grand Canyon is a breathtaking landscape of layered red rock bands revealing millions of years of geological history. Visitors can embark on rafting adventures along the roaring Colorado River or hike the iconic South Rim trails at sunrise.",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80",
    category: "Expedition",
    date: "2 Agustus 2026",
    readTime: "5 min read",
    likes: 380,
    rating: 4.9,
    reviewsCount: 380,
    priceOrTag: "$310",
    distanceOrMeta: "1,420 miles away",
  },
  {
    id: "blog-3",
    title: "Machu Picchu Sanctuary",
    subtitle: "Welcome To",
    welcomeTitle: "Machu Picchu Sanctuary",
    locationTitle: "Sacred Valley of the Incas",
    locationAddress: "Cusco Region, Peru",
    excerpt:
      "Perched high in the Andes Mountains above the Urubamba River valley, Machu Picchu stands as a testament to ancient architectural genius and mystical harmony with nature...",
    content:
      "Perched high in the Andes Mountains above the Urubamba River valley, Machu Picchu stands as a testament to ancient architectural genius and mystical harmony with nature. Built in the 15th century and later abandoned, its dry-stone walls fuse effortlessly with massive cliff faces. Experiencing the mist lifting over Huayna Picchu is an unforgettable moment of discovery.",
    image:
      "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1000&auto=format&fit=crop&q=80",
    category: "Heritage",
    date: "28 Juli 2026",
    readTime: "6 min read",
    likes: 512,
    rating: 4.8,
    reviewsCount: 512,
    priceOrTag: "$450",
    distanceOrMeta: "3,890 miles away",
  },
  {
    id: "blog-4",
    title: "Kyoto Bamboo Forest Path",
    subtitle: "Welcome To",
    welcomeTitle: "Kyoto Bamboo Forest Path",
    locationTitle: "Arashiyama Grove & Zen Gardens",
    locationAddress: "Kyoto Prefecture, Japan",
    excerpt:
      "Wandering through the soaring green stalks of Arashiyama Bamboo Grove offers a serene retreat into traditional Japanese aesthetics and peaceful contemplation...",
    content:
      "Wandering through the soaring green stalks of Arashiyama Bamboo Grove offers a serene retreat into traditional Japanese aesthetics and peaceful contemplation. As wind rustles through the dense canopy above, the rhythmic sound of bamboo swaying creates one of Japan's most officially protected soundscapes.",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&auto=format&fit=crop&q=80",
    category: "Sanctuary",
    date: "25 Juli 2026",
    readTime: "4 min read",
    likes: 289,
    rating: 4.9,
    reviewsCount: 289,
    priceOrTag: "$190",
    distanceOrMeta: "3,120 miles away",
  },
  {
    id: "blog-5",
    title: "Amalfi Coast Cliffside Gems",
    subtitle: "Welcome To",
    welcomeTitle: "Amalfi Coast Cliffside Gems",
    locationTitle: "Positano Coastal Terraces",
    locationAddress: "Salerno, Italy",
    excerpt:
      "Dramatic sheer cliffs plunging into sparkling sapphire waters define the legendary Amalfi Coast, where pastel-colored villages cling dramatically to Mediterranean slopes...",
    content:
      "Dramatic sheer cliffs plunging into sparkling sapphire waters define the legendary Amalfi Coast, where pastel-colored villages cling dramatically to Mediterranean slopes. From lemon-scented terraces in Positano to historic cathedral piazzas in Amalfi town, this UNESCO World Heritage coast embodies the ultimate dolce vita lifestyle.",
    image:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1000&auto=format&fit=crop&q=80",
    category: "Coastal",
    date: "20 Juli 2026",
    readTime: "5 min read",
    likes: 410,
    rating: 4.7,
    reviewsCount: 410,
    priceOrTag: "$390",
    distanceOrMeta: "5,400 miles away",
  },
];
