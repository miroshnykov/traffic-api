import consola from 'consola';
import { IGeoRule } from '../../Interfaces/geo';

// eslint-disable-next-line consistent-return
const resolveCountry = (country: string, rule: IGeoRule) => {
  if (country.toString() === rule.country.toString()) {
    if (rule.include) {
      return rule;
    }
  } else if (!rule.include) {
    return rule;
  }
};

export const geoRestrictions = async (country: string, geoRules: IGeoRule[]) => {
  try {
    const findConditions: any = [];
    geoRules.forEach((rule: IGeoRule) => {
      const rCountry = resolveCountry(country, rule);
      if (rCountry) {
        findConditions.push(rule);
      }
    });

    return findConditions;
  } catch (e) {
    consola.error('geoRestrictionsError:', e);
    return [];
  }
};
