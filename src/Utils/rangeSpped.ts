export const rangeSpeed = (time: number): number => {
  switch (true) {
    case time < 250:
      return 250;
    case time > 251 && time < 500:
      return 500;
    case time > 501 && time < 1000:
      return 1000;
    case time > 1001 && time < 1500:
      return 1500;
    case time > 1501 && time < 2000:
      return 2000;
    default:
      return 2500;
  }
};

export const rangeSpeedRecipe = (time: number): number => {
  switch (true) {
    case time < 1000:
      return 1000;
    case time > 1001 && time < 2000:
      return 2000;
    case time > 2001 && time < 3000:
      return 3000;
    case time > 3001 && time < 4000:
      return 4000;
    case time > 4001 && time < 5000:
      return 5000;
    case time > 5001 && time < 6000:
      return 6000;
    case time > 6001 && time < 7000:
      return 7000;
    case time > 7001 && time < 8000:
      return 8000;
    case time > 8001 && time < 9000:
      return 9000;
    case time > 9001 && time < 10000:
      return 10000;
    default:
      return 11000;
  }
};
