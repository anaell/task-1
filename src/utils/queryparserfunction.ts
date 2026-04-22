import { AgeGroup, Gender } from 'src/app.type';

export function parseSearchQuery(q: string) {
  const query = q.toLowerCase().trim();

  const result: any = {};

  // -------------------------
  // GENDER
  // -------------------------
  if (query.includes('male') && !query.includes('female')) {
    result.gender = Gender.male;
  }

  if (query.includes('female')) {
    result.gender = Gender.female;
  }

  // -------------------------
  // COUNTRY (very simple keyword map)
  // -------------------------
  const countryMap: Record<string, string> = {
    nigeria: 'NG',
    angola: 'AO',
    kenya: 'KE',
  };

  for (const [name, code] of Object.entries(countryMap)) {
    if (query.includes(name)) {
      result.country_id = code;
      break;
    }
  }

  // -------------------------
  // AGE RULES
  // -------------------------

  // young → 16–24
  if (query.includes('young')) {
    result.min_age = 16;
    result.max_age = 24;
  }

  // adult group
  if (query.includes('adult')) {
    result.age_group = AgeGroup.adult;
  }

  if (query.includes('teenager')) {
    result.age_group = AgeGroup.teenager;
  }

  if (query.includes('senior')) {
    result.age_group = AgeGroup.senior;
  }

  // "above 30"
  const aboveMatch = query.match(/above (\d+)/);
  if (aboveMatch) {
    result.min_age = parseInt(aboveMatch[1], 10);
  }

  // "below 20"
  const belowMatch = query.match(/below (\d+)/);
  if (belowMatch) {
    result.max_age = parseInt(belowMatch[1], 10);
  }

  if (Object.keys(result).length === 0) {
    return null;
  }

  return result;
}
