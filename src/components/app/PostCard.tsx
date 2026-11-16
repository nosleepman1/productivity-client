

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { PostResponse } from "../../api/PostsData"

export function SkeletonCard() {
  return (
    <Card className="w-full max-w-xs">
      <CardHeader>
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="aspect-video w-full" />
      </CardContent>
    </Card>
  )
}


interface PostCardProps {
  post: PostResponse
}

export function PostCard({ post }: PostCardProps) {
    return (
        <Card className="w-full max-w-xs">
            <CardHeader>
                <CardTitle>
                    {post.title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {post.body}
            </CardContent>
        </Card>
    )
}
