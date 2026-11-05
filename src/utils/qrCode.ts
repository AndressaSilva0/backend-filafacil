export interface ThermalReceiptData {
  ticketCode: string;
  patientName: string;
  cartaoSus?: string;
  service: string;
  priorityLabel: string;
  createdAt: string;
  qrPayload: string;
  formattedThermalText: string;
}

/**
 * Gera os dados de comprovante térmico com QR Code para impressoras de guichê
 */
export function generateThermalReceipt(ticket: {
  id: string;
  code: string;
  patientName: string;
  cartaoSus?: string | null;
  serviceLabel?: string | null;
  priorityLabel?: string | null;
  createdAt: Date;
}): ThermalReceiptData {
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(ticket.createdAt));

  const qrPayload = JSON.stringify({
    ticketId: ticket.id,
    code: ticket.code,
    name: ticket.patientName,
    date: ticket.createdAt.toISOString(),
  });

  const thermalText = `
========================================
           FILAFÁCIL - UBS / SUS        
         UNIDADE BÁSICA DE SAÚDE        
========================================

             SENHA DE ATENDIMENTO       
                 ${ticket.code}         

Prioridade: ${ticket.priorityLabel || "Normal"}
Serviço:    ${ticket.serviceLabel || "Clínico Geral"}
Paciente:   ${ticket.patientName}
Cartão SUS: ${ticket.cartaoSus || "Não Informado"}
Data/Hora:  ${formattedDate}

----------------------------------------
Acompanhe sua chamada nos painéis da UBS
Aguarde ser chamado pelo painel sonoro.
----------------------------------------
   Conserve este canhoto com você.
========================================
`.trim();

  return {
    ticketCode: ticket.code,
    patientName: ticket.patientName,
    cartaoSus: ticket.cartaoSus || undefined,
    service: ticket.serviceLabel || "Geral",
    priorityLabel: ticket.priorityLabel || "Normal",
    createdAt: ticket.createdAt.toISOString(),
    qrPayload,
    formattedThermalText: thermalText,
  };
}

