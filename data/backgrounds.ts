export interface BackgroundImage {
  id: string;
  thumbnail: string;
  full: string;
  description: string;
}

// Note: Using a CORS proxy for image fetching. In a production environment,
// these assets should be hosted on a domain that allows cross-origin requests.
// Images sourced from unsplash.com, which has a permissive license.

export const backgroundCategories: {
  [key: string]: BackgroundImage[]
} = {
  nature: [
    {
      id: "nature-1",
      thumbnail: "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=200&h=200&fit=crop",
      full: "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1920",
      description: "Lush green landscape with mountains and a river",
    },
    {
      id: "nature-2",
      thumbnail: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=200&h=200&fit=crop",
      full: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1920",
      description: "Misty forest path with sunlight filtering through",
    },
    {
      id: "nature-3",
      thumbnail: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=200&h=200&fit=crop",
      full: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1920",
      description: "Enchanted forest with mossy trees and a stream",
    },
     {
      id: "nature-4",
      thumbnail: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=200&h=200&fit=crop",
      full: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=1920",
      description: "Sunlight through green leaves",
    },
     {
      id: "nature-5",
      thumbnail: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=200&h=200&fit=crop",
      full: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=1920",
      description: "Close-up of lush green plant",
    },
  ],
  studio: [
    {
      id: "studio-1",
      thumbnail: "https://images.unsplash.com/photo-1599422442331-f1f9157a44f8?q=80&w=200&h=200&fit=crop",
      full: "https://images.unsplash.com/photo-1599422442331-f1f9157a44f8?q=80&w=1920",
      description: "Clean white studio background",
    },
    {
      id: "studio-2",
      thumbnail: "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=200&h=200&fit=crop",
      full: "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=1920",
      description: "Dark studio with a subtle texture",
    },
    {
      id: "studio-3",
      thumbnail: "https://images.unsplash.com/photo-1620138546344-7b2c385a4cdf?q=80&w=200&h=200&fit=crop",
      full: "https://images.unsplash.com/photo-1620138546344-7b2c385a4cdf?q=80&w=1920",
      description: "Soft gray studio backdrop",
    },
    {
      id: "studio-4",
      thumbnail: "https://images.unsplash.com/photo-1634017835449-41919426f85e?q=80&w=200&h=200&fit=crop",
      full: "https://images.unsplash.com/photo-1634017835449-41919426f85e?q=80&w=1920",
      description: "Pastel pink studio wall",
    },
     {
      id: "studio-5",
      thumbnail: "https://images.unsplash.com/photo-1554230522-3df68c7c7247?q=80&w=200&h=200&fit=crop",
      full: "https://images.unsplash.com/photo-1554230522-3df68c7c7247?q=80&w=1920",
      description: "Rich blue textured studio background",
    },
  ],
  abstract: [
    {
      id: "abstract-1",
      thumbnail: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200&h=200&fit=crop",
      full: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1920",
      description: "Purple and blue gradient",
    },
    {
      id: "abstract-2",
      thumbnail: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=200&h=200&fit=crop",
      full: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1920",
      description: "Soft multicolor light gradient",
    },
    {
      id: "abstract-3",
      thumbnail: "https://images.unsplash.com/photo-1507525428034-b723a9ce6890?q=80&w=200&h=200&fit=crop",
      full: "https://images.unsplash.com/photo-1507525428034-b723a9ce6890?q=80&w=1920",
      description: "Ocean waves abstract",
    },
    {
      id: "abstract-4",
      thumbnail: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?q=80&w=200&h=200&fit=crop",
      full: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?q=80&w=1920",
      description: "Wooden dock over blue water",
    },
     {
      id: "abstract-5",
      thumbnail: "https://images.unsplash.com/photo-1553095066-5014bc7b7f2d?q=80&w=200&h=200&fit=crop",
      full: "https://images.unsplash.com/photo-1553095066-5014bc7b7f2d?q=80&w=1920",
      description: "Smoky colorful light effect",
    },
  ],
};
