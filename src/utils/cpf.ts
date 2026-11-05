/**
 * Limpa o CPF deixando apenas números
 */
export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

/**
 * Formata o CPF no padrão 000.000.000-00
 */
export function formatCPF(cpf: string): string {
  const digits = cleanCPF(cpf);
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/**
 * Validação oficial do dígito verificador do CPF
 */
export function isValidCPF(cpf: string): boolean {
  const clean = cleanCPF(cpf);

  if (clean.length !== 11) return false;

  // Rejeita sequências repetidas como 111.111.111-11
  if (/^(\d)\1{10}$/.test(clean)) return false;

  // Primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9), 10)) return false;

  // Segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10), 10)) return false;

  return true;
}

