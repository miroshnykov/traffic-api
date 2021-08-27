import consola from "consola";

export const customLP = async (country: string, rules: any) => {

  try {
    let findConditions: any = []
    rules.forEach((rule: any) => {
      let rCountry = resolveCountry(country, rule)
      if (rCountry) {
        findConditions.push(rule)
      }
    })

    return findConditions

  } catch (e) {
    consola.error('customLP:', customLP)
    return []
  }
}

const resolveCountry = (country: string, rule: any) => {
  if (country.toString() === rule.country.toString()) {
    return rule
  }
}
