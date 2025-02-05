import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

import { MessageCircle, CheckCircle, Clock, User } from "lucide-react"

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
    <Card className="h-full flex flex-col bg-background-light/50 border-primary/20 hover:border-primary/40 transition-colors">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary/60" />
            {new Date(query.createdAt).toLocaleString()}
          </span>
          <Badge
            variant={query.resolvedBy ? "default" : "secondary"}
            className={`${
              query.resolvedBy
                ? "bg-green-500/20 text-green-500 border-green-500/40"
                : "bg-yellow-500/20 text-yellow-500 border-yellow-500/40"
            }`}
          >
            {query.resolvedBy ? (
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Resolved
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Pending
              </span>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="h-[200px] rounded-md border border-primary/20 p-4 bg-background/50">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 text-primary flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Query:
              </h3>
              <p className="text-sm text-gray-300">{query.query}</p>
            </div>
            {query.reply && (
              <div>
                <h3 className="font-semibold mt-4 mb-2 text-primary flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Reply:
                </h3>
                <p className="text-sm text-gray-300">{query.reply}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="text-sm text-gray-400">
        {query.resolvedBy ? (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary/60" />
            Resolved by: {query.resolvedBy.name}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-500/60" />
            Not yet resolved
          </div>
        )}
      </CardFooter>
    </Card>
  )
}