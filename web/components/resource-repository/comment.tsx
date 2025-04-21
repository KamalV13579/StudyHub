import { Card } from "@/components/ui/card";

type CommentProps = {
  comment: {
    id: string;
    content: string;
    author_name: string;
  };
};

export function Comment({ comment }: CommentProps) {
  return (
    <Card className="p-4">
      <p className="text-sm font-semibold">{comment.author_name}</p>
      <p>{comment.content}</p>
    </Card>
  );
}
