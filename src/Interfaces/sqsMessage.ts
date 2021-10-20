export interface ISqsMessage {
  comments: string,
  type?: string
  id: number
  action: string
  timestamp: number
  conversion_type?: string
  body: string
}
