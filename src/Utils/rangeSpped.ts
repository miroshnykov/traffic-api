export const rangeSpeed = (time: number): number => {
  switch (true) {
    case time < 500 :
      return 500
    case  time > 501 && time < 1000 :
      return 1000
    case  time > 1001 && time < 1500 :
      return 1500
    case  time > 1501 && time < 2000 :
      return 2000
    default:
      return 2500
  }
}