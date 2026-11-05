import PDFDocument from "pdfkit";

export interface ReportPdfData {
  period: string;
  totalAttended: number;
  totalWaiting: number;
  totalAbsent: number;
  averageWaitMinutes: number;
  targetMet: boolean;
  bySpecialty: { specialty: string; count: number; percentage: number }[];
  hourlyDistribution: { hour: string; count: number }[];
  absenteeismRate: number;
}

export function generateReportPdf(data: ReportPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // Cabeçalho Oficial
      doc
        .fillColor("#0f2d59")
        .fontSize(20)
        .text("FILAFÁCIL - RELATÓRIO ANALÍTICO UBS / SUS", { align: "center" })
        .moveDown(0.3);

      doc
        .fillColor("#64748b")
        .fontSize(10)
        .text(`Período do Relatório: ${data.period.toUpperCase()} • Gerado em: ${new Date().toLocaleString("pt-BR")}`, {
          align: "center",
        })
        .moveDown(1.5);

      doc
        .strokeColor("#cbd5e1")
        .lineWidth(1)
        .moveTo(40, doc.y)
        .lineTo(555, doc.y)
        .stroke()
        .moveDown(1);

      // Métricas Principais
      doc.fillColor("#0f2d59").fontSize(14).text("1. Indicadores Gerais de Atendimento").moveDown(0.5);

      doc
        .fontSize(11)
        .fillColor("#334155")
        .text(`• Total de Atendimentos Realizados: ${data.totalAttended}`)
        .text(`• Pacientes Aguardando no Momento: ${data.totalWaiting}`)
        .text(`• Pacientes Ausentes / Desistências: ${data.totalAbsent}`)
        .text(`• Tempo Médio de Espera Geral: ${data.averageWaitMinutes} minutos`)
        .text(`• Taxa de Absenteísmo: ${data.absenteeismRate.toFixed(1)}%`)
        .text(
          `• Meta do SUS (< 20 min): ${data.targetMet ? "ATINGIDA (Conforme)" : "NÃO ATINGIDA (Atenção Operacional)"}`
        )
        .moveDown(1.5);

      // Distribuição por Especialidade
      doc.fillColor("#0f2d59").fontSize(14).text("2. Atendimentos por Especialidade").moveDown(0.5);

      data.bySpecialty.forEach((s) => {
        doc
          .fontSize(10)
          .fillColor("#334155")
          .text(`  - ${s.specialty}: ${s.count} atendimentos (${s.percentage.toFixed(1)}%)`);
      });

      doc.moveDown(1.5);

      // Fluxo por Faixa Horária
      doc.fillColor("#0f2d59").fontSize(14).text("3. Distribuição do Fluxo Horário (Picos)").moveDown(0.5);

      data.hourlyDistribution.forEach((h) => {
        doc.fontSize(10).fillColor("#334155").text(`  - ${h.hour}: ${h.count} chamadas`);
      });

      doc.moveDown(2);

      // Rodapé
      doc
        .fontSize(8)
        .fillColor("#94a3b8")
        .text(
          "FilaFácil UBS • Sistema Integrado de Atenção Primária à Saúde • Ministério da Saúde",
          40,
          780,
          { align: "center", width: 515 }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

