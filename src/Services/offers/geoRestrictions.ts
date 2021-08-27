import consola from "consola";

export const geoRestrictions = async (country:string, geoRules:any) => {

  try {
    let findConditions:any = []
    geoRules.forEach((rule: any) => {
      let rCountry = resolveCountry(country, rule)
      if (rCountry) {
        findConditions.push(rule)
      }
    })

    return findConditions

  } catch (e) {
    consola.error('geoRestrictionsError:',e)
    return []
  }
}

const resolveCountry = (country:string, rule:any) => {
  if (country.toString() === rule.country.toString()) {
    if (rule.include) {
      return rule
    }
  } else {
    if (!rule.include) {
      return rule
    }
  }
}

