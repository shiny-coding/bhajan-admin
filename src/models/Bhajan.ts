export type Bhajan = {
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

export type SearchResult = {
  highlight: {
    title: string
    author: string
  },
  bhajan: {
    title: string
    author: string
  }
}
