import consola from 'consola';
import { ICustomLP } from '../../Interfaces/customLPRules';

// eslint-disable-next-line consistent-return
const resolveCountry = (country: string, rule: ICustomLP) => {
  if (country.toString() === rule.country.toString()) {
    return rule;
  }
};

export const customLP = async (country: string, rules: ICustomLP[]) => {
  try {
    const findConditions: any = [];
    rules.forEach((rule: ICustomLP) => {
      const rCountry = resolveCountry(country, rule);
      if (rCountry) {
        findConditions.push(rule);
      }
    });

    return findConditions;
  } catch (e) {
    consola.error('customLP:', customLP);
    return [];
  }
};
