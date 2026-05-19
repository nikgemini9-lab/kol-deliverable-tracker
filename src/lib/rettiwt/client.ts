import { Rettiwt } from 'rettiwt-api'

let rettiwtInstance: Rettiwt | null = null

export function getRettiwtClient(): Rettiwt {
  if (!rettiwtInstance) {
    const apiKey = process.env.RETTIWT_API_KEY
    if (!apiKey) {
      throw new Error('RETTIWT_API_KEY environment variable is not set')
    }
    rettiwtInstance = new Rettiwt({ apiKey })
  }
  return rettiwtInstance
}
