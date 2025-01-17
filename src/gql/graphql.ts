/* eslint-disable */
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** The `Upload` scalar type represents a file upload. */
  Upload: { input: any; output: any; }
};

export type Bhajan = {
  __typename?: 'Bhajan';
  audioPath?: Maybe<Scalars['String']['output']>;
  author: Scalars['String']['output'];
  chords?: Maybe<Scalars['String']['output']>;
  lastModified?: Maybe<Scalars['Float']['output']>;
  lessons?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Scalars['String']['output']>;
  reviewPath?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  translation?: Maybe<Scalars['String']['output']>;
};

export type ImportStats = {
  __typename?: 'ImportStats';
  numberAdded: Scalars['Int']['output'];
  numberReplaced: Scalars['Int']['output'];
  numberSkipped: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createBhajan?: Maybe<Scalars['Boolean']['output']>;
  deleteAllBhajans: Scalars['Boolean']['output'];
  deleteBhajan?: Maybe<Scalars['Boolean']['output']>;
  exportBhajans?: Maybe<Scalars['String']['output']>;
  importBhajans: ImportStats;
  reindexAll?: Maybe<Scalars['Boolean']['output']>;
};


export type MutationCreateBhajanArgs = {
  audioFile?: InputMaybe<Scalars['Upload']['input']>;
  audioPath?: InputMaybe<Scalars['String']['input']>;
  author: Scalars['String']['input'];
  chords?: InputMaybe<Scalars['String']['input']>;
  deleteAudio?: InputMaybe<Scalars['Boolean']['input']>;
  deleteReview?: InputMaybe<Scalars['Boolean']['input']>;
  lessons?: InputMaybe<Scalars['String']['input']>;
  oldAuthor?: InputMaybe<Scalars['String']['input']>;
  oldTitle?: InputMaybe<Scalars['String']['input']>;
  options?: InputMaybe<Scalars['String']['input']>;
  reviewFile?: InputMaybe<Scalars['Upload']['input']>;
  reviewPath?: InputMaybe<Scalars['String']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  translation?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteBhajanArgs = {
  author: Scalars['String']['input'];
  title: Scalars['String']['input'];
};


export type MutationImportBhajansArgs = {
  file: Scalars['Upload']['input'];
};

export type Query = {
  __typename?: 'Query';
  checkWriteToken?: Maybe<Scalars['Boolean']['output']>;
  getBhajan?: Maybe<Bhajan>;
  listBhajans?: Maybe<Array<Maybe<Bhajan>>>;
  searchBhajans?: Maybe<Array<Maybe<SearchResult>>>;
};


export type QueryCheckWriteTokenArgs = {
  writeTokenHash: Scalars['String']['input'];
};


export type QueryGetBhajanArgs = {
  author: Scalars['String']['input'];
  title: Scalars['String']['input'];
};


export type QuerySearchBhajansArgs = {
  searchTerm: Scalars['String']['input'];
};

export type SearchResult = {
  __typename?: 'SearchResult';
  bhajan: Bhajan;
  highlight: Bhajan;
  score?: Maybe<Scalars['Float']['output']>;
};
