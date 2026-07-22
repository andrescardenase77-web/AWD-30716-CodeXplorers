import { Request, Response } from 'express';

const API_BASE_URL = `${process.env.CRUD_API_URL || 'https://fabuladental-crud.duckdns.org/fabuladental'}/patients`;

// Validates an Ecuadorian national ID (cedula) using the official modulo-10 checksum algorithm.
// This is a self-contained algorithmic validation (no third-party lookup service involved),
// which is the standard, legally safe approach used by banks and fintechs in Ecuador.
const validateEcuadorianCedula = (cedula: string): { isValid: boolean; reason?: string } => {
  if (!/^\d{10}$/.test(cedula)) {
    return { isValid: false, reason: 'Cedula must contain exactly 10 digits.' };
  }

  const provinceCode = parseInt(cedula.substring(0, 2), 10);
  if (provinceCode < 1 || provinceCode > 24) {
    return { isValid: false, reason: 'Invalid province code (first two digits).' };
  }

  const thirdDigit = parseInt(cedula[2], 10);
  if (thirdDigit >= 6) {
    return { isValid: false, reason: 'Invalid third digit for a natural person cedula.' };
  }

  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let total = 0;

  for (let i = 0; i < 9; i++) {
    let value = parseInt(cedula[i], 10) * coefficients[i];
    if (value >= 10) {
      value -= 9;
    }
    total += value;
  }

  const verifierDigit = total % 10 === 0 ? 0 : 10 - (total % 10);
  const isValid = verifierDigit === parseInt(cedula[9], 10);

  return { isValid, reason: isValid ? undefined : 'Checksum (verifier digit) does not match.' };
};

export const parseBirthday = (value: unknown): Date | null => {
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

export const validateLegalRepresentative = async (req: Request, res: Response) => {
  try {
    const birthday = parseBirthday(req.body?.birthday ?? req.body?.dateOfBirth);
    const legalRep = req.body?.legalRepresentative || "";

    if (!birthday) {
      return res.status(400).json({ error: "Valid birthday format required." });
    }

    const { calculatedAgeYears } = calculateAge(birthday);

    if (calculatedAgeYears < 18 && legalRep.trim().length === 0) {
      return res.status(400).json({ error: "Patient is underage, legal representative is required." });
    }

    return res.status(200).json({
      valid: true,
      requiresLegalRepresentative: calculatedAgeYears < 18,
      message: calculatedAgeYears >= 18 ? "Legal representative not required." : "Legal representative provided successfully."
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal processing error validating legal representative." });
  }
};

export const calculateDaysToBirthday = async (req: Request, res: Response) => {
  try {
    const birthday = parseBirthday(req.body?.birthday ?? req.body?.dateOfBirth);

    if (!birthday) {
      return res.status(400).json({ error: "Valid birthday format required." });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
    
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = Math.abs(nextBirthday.getTime() - today.getTime());
    const daysUntilBirthday = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isBirthdayWeek = daysUntilBirthday <= 7;

    return res.status(200).json({
      daysUntilBirthday,
      isBirthdayWeek
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal processing error calculating days to birthday." });
  }
};

export const calculateSeniorDiscount = async (req: Request, res: Response) => {
  try {
    const birthday = parseBirthday(req.body?.birthday ?? req.body?.dateOfBirth);

    if (!birthday) {
      return res.status(400).json({ error: "Valid birthday format required." });
    }

    const { calculatedAgeYears } = calculateAge(birthday);
    const suggestedDiscountFactor = calculatedAgeYears >= 65 ? 0.50 : 0.00;

    return res.status(200).json({
      suggestedDiscountFactor,
      isEligibleForDiscount: calculatedAgeYears >= 65
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal processing error calculating senior discount." });
  }
};

export const estimateConsultationTime = async (req: Request, res: Response) => {
  try {
    const birthday = parseBirthday(req.body?.birthday ?? req.body?.dateOfBirth);
    const reason = req.body?.reasonForConsultation || "";

    if (!birthday) {
      return res.status(400).json({ error: "Valid birthday format required." });
    }

    const { calculatedAgeYears } = calculateAge(birthday);
    
    let estimatedConsultationMinutes = 15;

    if (calculatedAgeYears < 5 || calculatedAgeYears > 70) {
      estimatedConsultationMinutes += 10;
    }

    if (reason.length > 50) {
      estimatedConsultationMinutes += 10;
    }

    return res.status(200).json({
      estimatedConsultationMinutes,
      baseMinutes: 15
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal processing error estimating consultation time." });
  }
};

export const calculateContactPriority = async (req: Request, res: Response) => {
  try {
    const phone = req.body?.phone || "";
    const reason = req.body?.reasonForConsultation || "";

    let contactPriorityScore = 0;

    if (phone.length >= 10) {
      contactPriorityScore += 10;
    }

    const urgentKeywords = ["dolor", "urgencia", "sangrado", "emergencia"];
    const reasonLower = reason.toLowerCase();
    
    const hasUrgentKeywords = urgentKeywords.some(keyword => reasonLower.includes(keyword));
    
    if (hasUrgentKeywords) {
      contactPriorityScore += 50;
    }

    return res.status(200).json({
      contactPriorityScore,
      requiresImmediateAttention: contactPriorityScore >= 50
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal processing error calculating contact priority." });
  }
};

// External API used: SRI (Servicio de Rentas Internas de Ecuador) — the same public,
// no-auth endpoint the SRI's own "Consulta de RUC" web tool uses in the browser.
// A natural person's RUC is simply their cedula + "001", so we use it to confirm the
// cedula is registered in the official government taxpayer catastro.
// NOTE: this is a real government endpoint but it isn't formally documented for
// third-party use, so its response shape could change; the request is wrapped so a
// failure/format change degrades gracefully instead of crashing the endpoint.
// Not every valid patient will have a RUC (many citizens never register one), so this
// is used as a *supporting* signal, not as the sole source of truth — the authoritative
// check remains the local checksum algorithm.
const SRI_RUC_EXISTS_URL =
  process.env.SRI_RUC_EXISTS_URL ||
  'https://srienlinea.sri.gob.ec/sri-catastro-sujeto-servicio-internet/rest/ConsolidadoContribuyente/existePorNumeroRuc';

const checkCedulaRegisteredInSRI = async (cedula: string): Promise<{ checked: boolean; registered: boolean | null }> => {
  try {
    const ruc = `${cedula}001`;
    const response = await fetch(`${SRI_RUC_EXISTS_URL}?numeroRuc=${ruc}`, {
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      return { checked: false, registered: null };
    }

    const data = await response.json();
    // The endpoint has historically returned either a raw boolean or an object like
    // { existe: true }. We handle both shapes defensively.
    const registered = typeof data === 'boolean' ? data : Boolean(data?.existe ?? data?.exists ?? false);

    return { checked: true, registered };
  } catch {
    return { checked: false, registered: null };
  }
};

export const validateCedula = async (req: Request, res: Response) => {
  try {
    const cedula = String(req.body?.cedula ?? '').trim();

    if (!cedula) {
      return res.status(400).json({ error: "Cedula number required." });
    }

    const { isValid, reason } = validateEcuadorianCedula(cedula);
    const provinceCode = /^\d{10}$/.test(cedula) ? cedula.substring(0, 2) : null;

    // Only bother calling the external service if the checksum already passed —
    // no point spending a network call validating a structurally invalid number.
    const sriResult = isValid
      ? await checkCedulaRegisteredInSRI(cedula)
      : { checked: false, registered: null };

    return res.status(200).json({
      cedula,
      isValid,
      provinceCode,
      reason,
      sriLookup: {
        checked: sriResult.checked,
        registeredAsTaxpayer: sriResult.registered,
        note: "Informational only: not every valid cedula has a registered RUC in SRI."
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal processing error validating cedula." });
  }
};

// --- Birthday reminders (WhatsApp via Twilio) ---
// External API used: Twilio Messaging API (https://www.twilio.com/docs/whatsapp/api)
// Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_WHATSAPP_FROM in .env
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || ''; // e.g. 'whatsapp:+14155238886'

const sendWhatsAppMessage = async (toPhone: string, message: string): Promise<boolean> => {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
    throw new Error('Twilio credentials are not configured.');
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const body = new URLSearchParams({
    From: TWILIO_WHATSAPP_FROM,
    To: `whatsapp:${toPhone}`,
    Body: message
  });

  const authHeader = 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: authHeader
    },
    body
  });

  return response.ok;
};

const daysUntilNextBirthday = (birthday: Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }

  return Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// Meant to be triggered once a day (manually from the app, or via an external scheduler
// like a cron job / GitHub Actions / cron-job.org hitting this endpoint). No DB changes needed:
// it reads patients from the existing CRUD API and only sends a message, nothing is persisted.
export const sendBirthdayReminders = async (req: Request, res: Response) => {
  try {
    const response = await fetch(API_BASE_URL, {
      headers: { 'x-api-key': process.env.CRUD_API_KEY || '' }
    });

    if (!response.ok) throw new Error();
    const patients = await response.json();

    const results: Array<{ patientID: unknown; fullName: unknown; sent: boolean; error?: string }> = [];
    let remindersSent = 0;

    for (const patient of patients) {
      const birthday = parseBirthday(patient.birthday);
      if (!birthday || !patient.phone) continue;

      if (daysUntilNextBirthday(birthday) !== 0) continue;

      const message = `¡Feliz cumpleaños, ${patient.fullName}! De parte de todo el equipo de FabulaDental te deseamos un excelente día. 🦷🎉`;

      try {
        const sent = await sendWhatsAppMessage(patient.phone, message);
        if (sent) remindersSent++;
        results.push({ patientID: patient.patientID, fullName: patient.fullName, sent });
      } catch (sendError) {
        results.push({
          patientID: patient.patientID,
          fullName: patient.fullName,
          sent: false,
          error: sendError instanceof Error ? sendError.message : 'Unknown error sending reminder.'
        });
      }
    }

    return res.status(200).json({ success: true, remindersSent, results });
  } catch (error) {
    return res.status(500).json({ error: "Internal error sending birthday reminders." });
  }
};