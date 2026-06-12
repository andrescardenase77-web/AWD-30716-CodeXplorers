import { Request, Response } from 'express';

const API_BASE_URL = `http://${process.env.CRUD_API_IP}:3000/fabuladental/patients`;

const parseBirthday = (value: unknown): Date | null => {
  if (!value) {
    return null;
  }

  const rawValue = String(value).trim();
  const dateMatch = rawValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const normalizedValue = dateMatch
    ? `${dateMatch[3]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`
    : rawValue;
  const birthday = new Date(normalizedValue);

  if (Number.isNaN(birthday.getTime())) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (birthday > today) {
    return null;
  }

  return birthday;
};

const calculateAge = (birthday: Date) => {
  const today = new Date();
  let calculatedAgeYears = today.getFullYear() - birthday.getFullYear();
  let calculatedAgeMonths = today.getMonth() - birthday.getMonth();

  if (today.getDate() < birthday.getDate()) {
    calculatedAgeMonths--;
  }

  if (calculatedAgeMonths < 0) {
    calculatedAgeYears--;
    calculatedAgeMonths += 12;
  }

  const totalDays = Math.floor((today.getTime() - birthday.getTime()) / (1000 * 60 * 60 * 24));

  return { calculatedAgeYears, calculatedAgeMonths, totalDays };
};

const getClinicalCategory = (calculatedAgeYears: number, totalDays: number) => {
  if (totalDays <= 27) {
    return { pediatricCategory: 'Neonate', dosageRestrictionFactor: '0.1x' };
  }

  if (calculatedAgeYears < 1) {
    return { pediatricCategory: 'Infant', dosageRestrictionFactor: '0.2x' };
  }

  if (calculatedAgeYears < 4) {
    return { pediatricCategory: 'Toddler', dosageRestrictionFactor: '0.35x' };
  }

  if (calculatedAgeYears < 7) {
    return { pediatricCategory: 'Pre-schooler', dosageRestrictionFactor: '0.5x' };
  }

  if (calculatedAgeYears < 12) {
    return { pediatricCategory: 'School-age', dosageRestrictionFactor: '0.75x' };
  }

  if (calculatedAgeYears < 18) {
    return { pediatricCategory: 'Adolescent', dosageRestrictionFactor: '0.85x' };
  }

  return { pediatricCategory: 'Adult', dosageRestrictionFactor: '1.0x' };
};

export const calculatePatientPediatricCategory = async (req: Request, res: Response) => {
  try {
    const birthday = parseBirthday(req.body?.birthday ?? req.body?.dateOfBirth);

    if (!birthday) {
      return res.status(400).json({ error: "Valid birthday format required." });
    }

    const { calculatedAgeYears, calculatedAgeMonths, totalDays } = calculateAge(birthday);
    const { pediatricCategory, dosageRestrictionFactor } = getClinicalCategory(calculatedAgeYears, totalDays);

    return res.status(200).json({
      calculatedAgeYears,
      calculatedAgeMonths,
      pediatricCategory,
      dosageRestrictionFactor
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal processing error calculating clinical category." });
  }
};