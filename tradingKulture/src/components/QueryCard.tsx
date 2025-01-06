import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface QueryCardProps {
  query: {
    _id: string
    query: string
    reply: string
    createdAt: string
    resolvedBy: {
        name: string | null
    }
  }
}

export function QueryCard({ query }: QueryCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="text-sm font-medium">
            {new Date(query.createdAt).toLocaleString()}
          </span>
          <Badge variant={query.resolvedBy ? "default" : "secondary"}>
            {query.resolvedBy ? "Resolved" : "Pending"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="h-[200px] rounded-md border p-4">
          <h3 className="font-semibold mb-2">Query:</h3>
          <p className="text-sm">{query.query}</p>
          {query.reply && (
            <>
              <h3 className="font-semibold mt-4 mb-2">Reply:</h3>
              <p className="text-sm">{query.reply}</p>
            </>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        {query.resolvedBy ? `Resolved by: ${query.resolvedBy.name}` : "Not yet resolved"}
      </CardFooter>
    </Card>
  )
}

