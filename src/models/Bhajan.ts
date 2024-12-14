export type Bhajan1 = {
  author: string;
  title: string;
  text?: string;
  chords?: string;
  translation?: string;
  options?: string;
  review?: string;
  lessons?: string;
  audioPath?: string;
}

export type SearchResult1 = {
  highlight: {
    title: string
    author: string
  },
  bhajan: {
    title: string
    author: string
  }
}
