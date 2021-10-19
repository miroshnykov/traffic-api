export interface ICustomLPRules {
  customLPRules: ICustomLP[]
}

export interface ICustomLP {
  id: number,
  pos: number
  country: string
  lpName: string
  lpUrl: string
}
