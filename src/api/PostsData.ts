import { queryOptions } from "@tanstack/react-query";



export default function PostQuery() {
    return queryOptions({
        queryKey: ["posts"],
        queryFn: () => Posts(),
        staleTime: 30_000,
        gcTime: 60_000 
});

}


const Posts = async () : Promise<PostResponse[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts`);
  return await response.json();
}


export interface PostResponse {userId: number;
    id: number;
    title: string;
    body: string;
}