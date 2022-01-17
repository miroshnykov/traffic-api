import { IParams } from '../../Interfaces/params';

// eslint-disable-next-line consistent-return
const resolveDimension = (params: any, condition: any) => {
  const dimensionValue = params[condition.dimension];
  if (dimensionValue.toString().toLowerCase() === condition.value.toString().toLowerCase()) {
    if (condition.include) {
      return condition;
    }
  } else if (!condition.include) {
    return condition;
  }
};

export const resolveRules = async (params: IParams) => {
  if (!params.campaignInfo.targetRules) return;
  const findConditions: any = [];
  params.campaignInfo.targetRules.forEach((rules: any) => {
    const rulesFormat = JSON.parse(rules.rules);
    const redirectOfferId = rulesFormat.redirectTo;

    rulesFormat.rules.forEach((filterGroups: any) => {
      const { include } = filterGroups;
      filterGroups.filterGroups.forEach((cond: any) => {
        cond.conditions.forEach((condition: any) => {
          condition.include = include;
          condition.redirectOfferId = redirectOfferId;

          const rDimension = resolveDimension(params, condition);
          if (rDimension) {
            findConditions.push(condition);
          }
        });
      });
    });
  });

  // eslint-disable-next-line consistent-return
  return findConditions;
};
