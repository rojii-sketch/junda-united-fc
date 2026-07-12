// src/data/initialData.js

export const initialNews = [
  {
    id: "news-1",
    title: "United Secure Thrilling 3-2 Derby Win",
    content: "An incredible last-minute header from our star forward clinched all three points in a dramatic derby match. The atmosphere at the stadium was electric as the team climbed to second in the league standings.",
    date: "2026-07-10",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=60"
  },
  {
    id: "news-2",
    title: "New Training Facility Upgrades Announced",
    content: "The club board has approved a multi-million budget to upgrade our youth academy pitches and gym facilities. Work is scheduled to begin early next month to ensure our players have world-class resources.",
    date: "2026-07-05",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&auto=format&fit=crop&q=60"
  }
];

export const initialPlayers = [
  // --- Players ---
  {
    id: "player-1",
    name: "Marcus Vance",
    position: "Forward",
    jerseyNumber: "9",
    role: "player",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=60"
  },
  {
    id: "player-2",
    name: "Elena Rostova",
    position: "Midfielder",
    jerseyNumber: "8",
    role: "player",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60"
  },
  // --- Coaching Staff ---
  {
    id: "coach-1",
    name: "Robert Silva",
    position: "Head Coach",
    jerseyNumber: "",
    role: "coach",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=60"
  },
  // --- Support Staff ---
  {
    id: "staff-1",
    name: "Dr. Sarah Jenkins",
    position: "Chief Medical Officer",
    jerseyNumber: "",
    role: "staff",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=60"
  }
];

export const initialGallery = [
  {
    id: "media-1",
    type: "image",
    url: "https://images.unsplash.com/photo-1577223625856-75d9109d6b60?w=600&auto=format&fit=crop&q=60",
    caption: "Midweek tactical drilling session."
  },
  {
    id: "media-2",
    type: "image",
    url: "https://images.unsplash.com/photo-1431324155629-1a6dba1ddae7?w=600&auto=format&fit=crop&q=60",
    caption: "Fans celebrating our opening match goal."
  },
  {
    id: "media-3",
    type: "video",
    // Standard sample MP4 video link that will work directly in HTML5 video tags
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    caption: "Check out this rocket from practice!"
  }
];