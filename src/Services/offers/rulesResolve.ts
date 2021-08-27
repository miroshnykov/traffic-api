import consola from "consola";

export const resolveRules = async (params: any) => {

  if (! params.campaignInfo.targetRules) return
  try {
    let findConditions: any = []
    params.campaignInfo.targetRules.forEach((rules: any) => {

      let rulesFormat = JSON.parse(rules.rules)
      let redirectOfferId = rulesFormat.redirectTo

      rulesFormat.rules.forEach((filterGroups: any) => {

        let include = filterGroups.include
        filterGroups.filterGroups.forEach((cond: any) => {
          cond.conditions.forEach((condition: any) => {
            condition.include = include
            condition.redirectOfferId = redirectOfferId

            let rDimension = resolveDimension(params, condition)
            if (rDimension) {

              findConditions.push(condition)
            }

          })

        })

      })
    })

    return findConditions

  } catch (e) {
    consola.error('resolveError', e)
    return []
  }
}

const resolveDimension = (params: any, condition: any) => {
  let dimensionValue = params[condition.dimension]
  if (dimensionValue.toString().toLowerCase() === condition.value.toString().toLowerCase()) {
    if (condition.include) {
      return condition
    }
  } else {
    if (!condition.include) {
      return condition
    }
  }
}
