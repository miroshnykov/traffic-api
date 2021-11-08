export interface IGeo {
  country: string
  region: string
  city: string
  isp: string
  ll: Array<string>
}

export interface IGeoRule {
  country: string
  include: boolean
}
